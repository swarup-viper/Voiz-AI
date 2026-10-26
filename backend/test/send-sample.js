// test/send-sample.js
// Sends sample feedback items to the local backend API

async function sendFeedback() {
  const payload = {
    audience_type: "university students",
    items: [
      {
        text: "The Wi-Fi in the Science Library disconnects every 5 minutes during peak study hours. Online exams are terrifying.",
      },
      {
        text: "The campus shuttle is always 20 minutes late on rainy days, leaving freshmen stranded in the cold.",
      },
      {
        text: "I really love the new 24/7 quiet study pods on the 3rd floor, they are a lifesaver!",
      },
      {
        text: "The library internet keeps dropping constantly while we try to submit assignments.",
      },
      {
        text: "Could we please add more vegan and gluten-free lunch options in the main dining hall?",
      },
    ],
  };

  console.log("Sending feedback to http://localhost:3000/api/analyze ...");

  try {
    const res = await fetch("http://localhost:3000/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    console.log(`\nStatus Code: ${res.status}`);
    console.log("\nResponse from server:");
    console.log(JSON.stringify(data, null, 2));

    if (res.ok) {
      console.log("\n Success! You can now check http://localhost:3000/api/opportunities in your browser.");
    }
  } catch (err) {
    console.error("Failed to connect to local server:", err.message);
    console.log("Make sure 'npm run dev' is running in your terminal!");
  }
}

sendFeedback();
