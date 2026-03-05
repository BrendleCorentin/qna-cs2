import { HLTV } from 'hltv';

async function test() {
    try {
        console.log("Calling getTeamRanking...");
        const res = await HLTV.getTeamRanking();
        console.log("Result type:", typeof res);
        console.log("Result length:", res ? res.length : "null");
        if (res && res.length > 0) console.log("First team:", res[0]);
    } catch (e) {
        console.error("Error:", e);
    }
}
test();
