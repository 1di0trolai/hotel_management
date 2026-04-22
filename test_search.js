const RoomModel = require('./src/models/roomModel');

async function test() {
    try {
        const res = await RoomModel.searchRooms('2026-05-01', '2026-05-02', 2);
        console.log("Success:", res);
    } catch (e) {
        console.log("Error:", e);
    }
    process.exit(0);
}
test();
