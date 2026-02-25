// test_bcrypt.js
import bcrypt from 'bcryptjs';

async function test() {
    console.log("Start test...");
    try {
        const hash = await bcrypt.hash("test", 10);
        console.log("Hash created:", hash);
        const match = await bcrypt.compare("test", hash);
        console.log("Match result:", match);
    } catch (e) {
        console.error("Error:", e);
    }
}

test();
