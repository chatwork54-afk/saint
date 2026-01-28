// ❤️ Date début relation
const startDate = new Date("2024-07-19T00:00:00");

function updateLoveTime(){

  const now = new Date();
  const diff = now - startDate;

  const seconds = Math.floor(diff / 1000);

  const days = Math.floor(seconds / (3600 * 24));
  const hours = Math.floor((seconds % (3600 * 24)) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  document.getElementById("days").innerHTML = `
    💞 Mabdhena taw 3ana  <br><br>

    <span class="counter">
      ${days} nhar |
      ${hours} se3a |
      ${minutes} D9i9a |
      ${secs} thenia
    </span>

    <br><br>
    ♾️ Forever together ya l7ob ❤️
  `;
}

// update every second
setInterval(updateLoveTime, 1000);

updateLoveTime();
