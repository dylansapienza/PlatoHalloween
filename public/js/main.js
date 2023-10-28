// Check if the browser supports the Web Speech API
if (!("webkitSpeechRecognition" in window)) {
  alert("Web Speech API is not supported by this browser. Try using Chrome.");
}

const recognition = new webkitSpeechRecognition();
recognition.continuous = true;
recognition.interimResults = true;

let finalTranscript = "";
let isListening = false;

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
};

recognition.onend = function () {
  isListening = false; // Update the state when recognition ends
  document.getElementById("listeningBar").style.display = "none";
  microphoneIcon.className = "fas fa-microphone"; // Set icon back to microphone
};

const startBtn = document.getElementById("startBtn");
const microphoneIcon = startBtn.querySelector(".fas");
const transcriptDiv = document.getElementById("transcript");

startBtn.addEventListener("click", () => {
  console.log(isListening);
  if (isListening) {
    // If it's currently listening
    recognition.stop();
    document.getElementById("listeningBar").style.display = "none";
    console.log(finalTranscript.trim());
    if (finalTranscript.trim() !== "") {
      console.log("Sending to OpenAI");
      try {
        document.getElementById("loadingSpinner").style.display = "block";
        sendToOpenAI(finalTranscript.trim());
      } catch (error) {
        sendToOpenAI(finalTranscript.trim());
      }
    }
    microphoneIcon.className = "fas fa-microphone"; // Change to microphone icon
  } else {
    finalTranscript = "";
    recognition.start();
    document.getElementById("listeningBar").style.display = "block";
    microphoneIcon.className = "fas fa-stop"; // Change to stop icon
  }
});

recognition.onstart = function () {
  isListening = true; // Update the state when recognition starts
};

function sendToOpenAI(text) {
  const PROXY_ENDPOINT = "/api/proxy"; // Assuming your frontend is on the same domain as the backend
  console.log("Sending to OpenAI: " + text);
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

      // Hide the spinner
      document.getElementById("loadingSpinner").style.display = "none";
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
