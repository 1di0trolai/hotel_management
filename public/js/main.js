document.addEventListener('DOMContentLoaded', () => {
    // Change header background on scroll
    const header = document.querySelector('.glass-header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.style.background = 'rgba(15, 17, 21, 0.95)';
            header.style.boxShadow = '0 5px 20px rgba(0,0,0,0.5)';
        } else {
            header.style.background = 'rgba(15, 17, 21, 0.8)';
            header.style.boxShadow = 'none';
        }
    });

    // Handle auth state
    const guest = JSON.parse(localStorage.getItem('guest'));
    const loginLink = document.querySelector('a[href="/login.html"]');
    if (guest && loginLink) {
        loginLink.outerHTML = `
            <div style="display:flex; align-items:center; gap: 1rem;">
                <span style="color:#fff; font-size:0.9rem;">Xin chào, <b>${guest.FirstName}</b></span>
                <button onclick="localStorage.removeItem('guest'); window.location.reload();" class="btn btn-outline" style="padding: 0.5rem 1rem;">Đăng xuất</button>
            </div>
        `;
    }

    initSearchBar();
    loadDefaultRooms();
});

async function loadDefaultRooms() {
    const container = document.getElementById('rooms-container');
    const title = document.getElementById('room-section-title');
    const desc = document.getElementById('room-section-desc');

    title.textContent = 'Danh sách Hạng Phòng';
    desc.textContent = 'Khám phá không gian nghỉ dưỡng đỉnh cao tại khách sạn của chúng tôi.';

    try {
        const response = await fetch('/api/rooms');
        if (!response.ok) throw new Error('Network error');
        const rooms = await response.json();

        // Group by room type since DB returns all 20 specific rooms
        const uniqueTypes = {};
        rooms.forEach(r => {
            if (!uniqueTypes[r.RoomType]) {
                uniqueTypes[r.RoomType] = r;
            }
        });

        container.innerHTML = '';
        Object.values(uniqueTypes).forEach(rec => {
            const card = document.createElement('div');
            card.className = 'room-card';
            card.innerHTML = `
                <div class="room-img-wrapper" style="cursor:pointer;" onclick="openRoomModal('${rec.RoomType}', '${rec.RoomDesc}', '${rec.RoomImg}', ${rec.Occupancy})">
                    <img src="/images/${rec.RoomImg}" alt="${rec.RoomType}" onerror="this.src='/images/standard.jpg'">
                    <div class="room-price-tag">$${rec.RoomPrice} / đêm</div>
                </div>
                <div class="room-info">
                    <h3 style="cursor:pointer;" onclick="openRoomModal('${rec.RoomType}', '${rec.RoomDesc}', '${rec.RoomImg}', ${rec.Occupancy})">${rec.RoomType}</h3>
                    <p style="color:var(--primary); font-weight:600; font-size:0.9rem; margin-bottom: 0.5rem;">
                        Sức chứa tối đa: ${rec.Occupancy} khách
                    </p>
                    <p>${rec.RoomDesc}</p>
                    <div class="room-meta">
                        <button class="btn btn-outline" style="width: 100%" onclick="document.getElementById('search-arrival').focus(); window.scrollTo({top: 0, behavior: 'smooth'});">
                            Nhập ngày để đặt
                        </button>
                    </div>
                </div>
            `;
            container.appendChild(card);
        });

    } catch (e) {
        console.error(e);
        container.innerHTML = '<p style="color:red">Lỗi tải dữ liệu phòng mặc định.</p>';
    }
}

function initSearchBar() {
    const arrivalInput = document.getElementById('search-arrival');
    const departureInput = document.getElementById('search-departure');
    const searchForm = document.getElementById('search-form');

    // Default dates: Today to Tomorrow
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);

    arrivalInput.value = today.toISOString().split('T')[0];
    departureInput.value = tomorrow.toISOString().split('T')[0];

    // Ensure departure > arrival
    arrivalInput.addEventListener('change', () => {
        if (departureInput.value <= arrivalInput.value) {
            let nextDay = new Date(arrivalInput.value);
            nextDay.setDate(nextDay.getDate() + 1);
            departureInput.value = nextDay.toISOString().split('T')[0];
        }
    });

    searchForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const arrivalDate = arrivalInput.value;
        const departureDate = departureInput.value;
        const guests = window.guestCounts.adults + window.guestCounts.children;
        const numRooms = window.guestCounts.rooms;

        await searchRooms(arrivalDate, departureDate, guests, numRooms);
    });
}

// Popover Logic
window.guestCounts = { rooms: 1, adults: 2, children: 0 };

function toggleGuestPopover() {
    const popover = document.getElementById('guests-popover');
    popover.style.display = popover.style.display === 'none' ? 'block' : 'none';
}

function updateCount(type, change) {
    let newVal = window.guestCounts[type] + change;

    // Limits
    if (type === 'rooms' && (newVal < 1 || newVal > 5)) return;
    if (type === 'adults' && (newVal < 1 || newVal > 16)) return;
    if (type === 'children' && (newVal < 0 || newVal > 10)) return;

    // Enforce basic max capacity
    if (type === 'adults' || type === 'children') {
        const totalGuests = (type === 'adults' ? newVal : window.guestCounts.adults) +
            (type === 'children' ? newVal : window.guestCounts.children);
        if (totalGuests > window.guestCounts.rooms * 8) {
            // Cannot exceed 8 per room (suite max is 16 which is 2*8 maybe)
            return;
        }
    }

    window.guestCounts[type] = newVal;
    document.getElementById(`count-${type}`).textContent = newVal;

    // Update Display Text
    const totalKhach = window.guestCounts.adults + window.guestCounts.children;
    document.getElementById('guests-display').textContent = `${window.guestCounts.rooms} Phòng, ${totalKhach} Khách`;
}

async function searchRooms(arrivalDate, departureDate, guests, numRooms) {
    const container = document.getElementById('rooms-container');
    const title = document.getElementById('room-section-title');
    const desc = document.getElementById('room-section-desc');

    container.innerHTML = '<div class="loading-spinner">Mô phỏng hệ thống gợi ý phòng...</div>';
    title.textContent = 'Đang tìm kiếm...';
    desc.textContent = '';

    // Smooth scroll to results
    document.getElementById('rooms').scrollIntoView({ behavior: 'smooth' });

    try {
        const response = await fetch('/api/rooms/search', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ arrivalDate, departureDate, guests, numRooms })
        });

        if (!response.ok) throw new Error('Network error');
        const recommendations = await response.json();

        container.innerHTML = '';
        title.textContent = 'Phòng Đề Cử';
        desc.textContent = `Các phương án tối ưu nhất dành cho ${guests} khách (${arrivalDate} → ${departureDate})`;

        if (recommendations.length === 0) {
            container.innerHTML = '<p style="text-align:center;width:100%;color:#a0a0a0;font-size:1.2rem;">Rất tiếc! Không còn phòng trống cho số lượng khách và thời gian bạn chọn.</p>';
            return;
        }

        recommendations.forEach(rec => {
            const card = document.createElement('div');
            card.className = 'room-card';

            card.innerHTML = `
                <div class="room-img-wrapper" style="cursor:pointer;" onclick="openRoomModal('${rec.RoomType}', '${rec.RoomDesc}', '${rec.RoomImg}', ${rec.Occupancy})">
                    <img src="/images/${rec.RoomImg}" alt="${rec.RoomType}" onerror="this.src='/images/deluxe.jpg'">
                    <div class="room-price-tag">$${rec.totalPrice} / đêm</div>
                </div>
                <div class="room-info">
                    <h3 style="cursor:pointer;" onclick="openRoomModal('${rec.RoomType}', '${rec.RoomDesc}', '${rec.RoomImg}', ${rec.Occupancy})">${rec.roomsNeeded} x ${rec.RoomType}</h3>
                    <p style="color:var(--primary); font-weight:600; font-size:0.9rem; margin-bottom: 0.5rem;">
                        Tối đa: ${rec.Occupancy * rec.roomsNeeded} khách
                    </p>
                    <p>${rec.RoomDesc}</p>
                    <div class="room-meta">
                        <span class="meta-item">
                            ${rec.AvailableCount >= rec.roomsNeeded ? `<span style="color:#4CAF50">✓ Đủ phòng trống</span>` : `<span style="color:red">Chỉ còn ${rec.AvailableCount} phòng</span>`}
                        </span>
                        <button class="btn btn-primary" style="padding: 0.5rem 1.25rem; font-size: 0.9rem;" 
                            ${rec.AvailableCount < rec.roomsNeeded ? 'disabled' : ''}
                            onclick="bookRoom('${rec.RoomType}', '${arrivalDate}', '${departureDate}', ${rec.roomsNeeded})">
                            Đặt Gói Này
                        </button>
                    </div>
                </div>
            `;
            container.appendChild(card);
        });

    } catch (error) {
        console.error('Error fetching search results:', error);
        container.innerHTML = '<p style="text-align:center;width:100%;color:red">Lỗi tải dữ liệu. Vui lòng thử lại.</p>';
    }
}

function bookRoom(type, arrival, departure, quantity) {
    const guest = JSON.parse(localStorage.getItem('guest'));
    if (!guest) {
        alert('Vui lòng đăng nhập để tiến hành đặt phòng!');
        window.location.href = '/login.html';
    } else {
        window.location.href = `/book.html?type=${encodeURIComponent(type)}&arrival=${arrival}&departure=${departure}&qty=${quantity}`;
    }
}

// Modal Logic
function openRoomModal(title, desc, img, occupancy) {
    document.getElementById('room-detail-modal').style.display = 'flex';
    document.getElementById('modal-room-title').textContent = title;
    document.getElementById('modal-room-desc').textContent = desc;
    document.getElementById('modal-main-img').src = `/images/${img}`;

    // Customize area randomly to look good
    let sqmAmt = occupancy > 4 ? "65 m²" : (occupancy > 2 ? "35 m²" : "27 m²");
    document.getElementById('modal-room-area').textContent = `📐 ${sqmAmt}`;
}

function closeRoomModal() {
    document.getElementById('room-detail-modal').style.display = 'none';
}

function changeImage(element, type = 'thumb') {
    // Remove active from peers
    const row = document.querySelector('.thumbnail-row');
    row.querySelectorAll('.thumb').forEach(t => t.classList.remove('active'));
    element.classList.add('active');

    // MOCK: Generate a placeholder dynamically instead of changing the real image if we don't have real images
    const text = element.textContent;

    // We modify the main image style to show the overlay text or just ignore changing source since it's mock
    // For effect, we can slightly change opacity or rely on CSS
}
