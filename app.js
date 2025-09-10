const oathModal = document.getElementById("oathModal");
const oathAccept = document.getElementById("oathAccept");
const oathCancel = document.getElementById("oathCancel");
const calendarEl = document.getElementById("calendar");
const logEl = document.getElementById("log");
const ringtoneInput = document.getElementById("ringtoneInput");
const saveRingtoneBtn = document.getElementById("saveRingtoneBtn");
const testRingtoneBtn = document.getElementById("testRingtoneBtn");

let customRingtone = null;
let schedule = [];
let completedTasks = new Set();

// ----------------- Oath Modal -----------------
function showOathModal() {
  oathModal.style.display = "flex";
}
function hideOathModal() {
  oathModal.style.display = "none";
}
window.addEventListener("load", () => {
  if (!localStorage.getItem("swornOath")) {
    showOathModal();
  } else {
    renderCalendar();
  }
});
oathAccept.addEventListener("click", () => {
  localStorage.setItem("swornOath", "true");
  hideOathModal();
  renderCalendar();
});
oathCancel.addEventListener("click", () => {
  alert("Take your time. Come back when you are ready 🙏");
});

// ----------------- Ringtone -----------------
saveRingtoneBtn.addEventListener("click", () => {
  if (ringtoneInput.files.length > 0) {
    const file = ringtoneInput.files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
      customRingtone = e.target.result;
      localStorage.setItem("oraRingtone", customRingtone);
      alert("Ringtone saved!");
    };
    reader.readAsDataURL(file);
  }
});

testRingtoneBtn.addEventListener("click", () => {
  const sound = new Audio(customRingtone || localStorage.getItem("oraRingtone"));
  sound.play();
});


// ----------------- Schedule -----------------
schedule = [
  { time: "05:59.AM", task: "Wake up Love😚" },
  { time: "06:00.AM", task: "Fajr Prayer,Read Quran🕌" },
  { time: "06:30.AM", task: "Work out,Shower,Breakfast🍽️" },
  { time: "08:00.AM to 12:30.PM", task: "Study📖" },
  { time: "12:30.PM", task: "Break🕒" },
  { time: "01:00.PM", task: "Dhuhr Prayer,Lunch🍽️" },
  { time: "02:00.PM to 06:30.PM", task: "Study📖" },
  { time: "04:30.PM", task: "Asr Prayer🕌" },
  { time: "06:45", task: "Magrib prayer🕌" },
  { time: "07:15.PM to 09:00.PM", task: "Our Time💗" },
  { time: "09:30", task: "Isha Prayer🕌" },
  { time: "10:00.PM", task: "Sleep well😴" }
];

function renderCalendar() {
  calendarEl.innerHTML = "";
  schedule.forEach((item, idx) => {
    const div = document.createElement("div");
    div.className = "task";
    div.innerHTML = `<strong>${item.time}</strong> - ${item.task} 
      <button onclick="markDone(${idx})">Done✔️</button>`;
    calendarEl.appendChild(div);
    scheduleAlarm(item, idx);
  });
}

// ----------------- Alarms -----------------
function scheduleAlarm(item, idx) {
  const [h, m] = item.time.split(":").map(Number);
  const now = new Date();
  const alarmTime = new Date();
  alarmTime.setHours(h, m, 0, 0);

  if (alarmTime < now) return;
  const timeout = alarmTime.getTime() - now.getTime();
  setTimeout(() => {
    showNotification(item, idx);
  }, timeout);
}

function showNotification(item, idx) {
  const sound = new Audio(customRingtone || localStorage.getItem("oraRingtone"));
  sound.play();
  if (Notification.permission === "granted") {
    new Notification("⏰ Ora Reminder", { body: `${item.task} (${item.time})` });
  }
  const confirmBtn = confirm(`Did you complete: ${item.task}?`);
  if (confirmBtn) {
    markDone(idx);
  } else {
    logEl.innerHTML += `<p>❌ Ignored: ${item.task} (${item.time})</p>`;
  }
}

// ----------------- Task Done -----------------
function markDone(idx) {
  const task = schedule[idx];
  completedTasks.add(idx);
  logEl.innerHTML += `<p>✔️Completed: ${task.task} (${task.time})</p>`;
  if (completedTasks.size === schedule.length) {
    showReward();
  }
}

// ----------------- Reward -----------------
function showReward() {
  const rewardDiv = document.createElement("div");
  rewardDiv.className = "modal-overlay";
  rewardDiv.innerHTML = `
    <div class="modal">
      <h2>🎉 Congratulations!</h2>
      <p>Mr.Mahdi You have successfully completed all your tasks for today. I’m so proud of you💕 and you have earned a special reward where your gf is going to fulfill your one wish👏</p>
      <button onclick="this.parentElement.parentElement.remove()">Close</button>
    </div>`;
  document.body.appendChild(rewardDiv);
}

// ----------------- Notifications -----------------
if ("Notification" in window) {
  Notification.requestPermission();
}
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('service-worker.js')
    .then(reg => console.log("Service Worker Registered", reg))
    .catch(err => console.log("SW Registration Failed:", err));
}
// Only run if browser supports messaging
if (firebase.messaging.isSupported()) {
  // Request notification permission from the user
  Notification.requestPermission().then(permission => {
    if (permission !== 'granted') {
      console.log('Notification permission denied');
      return;
    }

    // Register service worker
    navigator.serviceWorker.register('/firebase-messaging-sw.js')
      .then((registration) => {
        const messaging = firebase.messaging();
        messaging.useServiceWorker(registration);

        // Get FCM token
        return messaging.getToken({ vapidKey: 'YOUR_PUBLIC_VAPID_KEY' });
      })
      .then(token => {
        console.log("Firebase token:", token);
        // You can send this token to your backend
      })
      .catch(err => console.error("Error getting FCM token:", err));
  });
} else {
  console.log("Firebase messaging is not supported in this browser.");
}
