async function test() {
    try {
        const res = await fetch("http://localhost:8082/api/generate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ prompt: "Testing vite proxy" })
        });
        console.log("Status:", res.status);
        console.log("Response:", await res.json());
    } catch (err) {
        console.error("Fetch failed:", err);
    }
}
test();
