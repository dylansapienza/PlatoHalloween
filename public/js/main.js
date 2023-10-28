// Check if the browser supports the Web Speech API
if (!("webkitSpeechRecognition" in window)) {
  alert("Web Speech API is not supported by this browser. Try using Chrome.");
}

const recognition = new webkitSpeechRecognition();
recognition.continuous = true;
recognition.interimResults = true;

let finalTranscript = "";
let silenceTimer;

recognition.onresult = function (event) {
  let interimTranscript = "";

  for (let i = event.resultIndex; i < event.results.length; i++) {
    const transcript = event.results[i][0].transcript;
    if (event.results[i].isFinal) {
      finalTranscript += transcript;
    } else {
      interimTranscript += transcript;
    }
  }

  transcriptDiv.innerHTML =
    finalTranscript + "<i>" + interimTranscript + "</i>";

  // Reset silence timer upon receiving any speech result
  clearTimeout(silenceTimer);
  silenceTimer = setTimeout(() => {
    recognition.stop();
    sendToOpenAI(finalTranscript.trim());
  }, 4000);
};

recognition.onend = function () {
  clearTimeout(silenceTimer);
};

const startBtn = document.getElementById("startBtn");
const transcriptDiv = document.getElementById("transcript");

startBtn.addEventListener("click", () => {
  finalTranscript = "";
  recognition.start();
});

function sendToOpenAI(text) {
  const PROXY_ENDPOINT = "/api/proxy"; // Assuming your frontend is on the same domain as the backend

  fetch(PROXY_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text: text }),
  })
    .then((response) => response.json())
    .then((data) => {
      const outputText = data.text;
      console.log(outputText);
      document.getElementById("response").innerText = outputText;

      // Convert text to speech and play it for the user
      speakText(outputText);
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}

function actuallySpeak(text) {
  const speechSynthesis = window.speechSynthesis;
  const utterance = new SpeechSynthesisUtterance();

  // Set the voice of the utterance to Daniel's UK voice.
  utterance.voice = speechSynthesis
    .getVoices()
    .find((voice) => voice.name === "Daniel (English (United Kingdom))");
  // Set the text of the utterance.
  utterance.text = text;

  // Speak the utterance.x
  speechSynthesis.speak(utterance);
}

let hasEnabledVoice = false;

function speakText(text) {
  const utterance = new SpeechSynthesisUtterance();

  // Set the voice of the utterance to Daniel's UK voice if available
  const danielVoice = speechSynthesis
    .getVoices()
    .find((voice) => voice.name === "Daniel");
  if (danielVoice) {
    utterance.voice = danielVoice;
  }

  utterance.text = text;

  utterance.volume = 1; // Set to maximum volume

  // Speak the utterance
  speechSynthesis.speak(utterance);
}

// Event listener to unlock the Speech API on the first user interaction
document.addEventListener("click", function unlockTTS() {
  if (hasEnabledVoice) {
    return;
  }

  const silentUtterance = new SpeechSynthesisUtterance("unlocking");
  silentUtterance.volume = 0;
  const danielVoice = speechSynthesis
    .getVoices()
    .find((voice) => voice.name === "Daniel (English (United Kingdom))");
  if (danielVoice) {
    silentUtterance.voice = danielVoice;
  }
  speechSynthesis.speak(silentUtterance);

  hasEnabledVoice = true;

  // Remove the event listener after unlocking
  document.removeEventListener("click", unlockTTS);
});
