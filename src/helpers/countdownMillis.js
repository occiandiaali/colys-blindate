export default function countdownMillis(countdownTime) {
  // Start the countdown
  let remainingTime = countdownTime;

  const countdownInterval = setInterval(() => {
    // Calculate remaining time
    const seconds = Math.floor((remainingTime % (1000 * 60)) / 1000);
    const milliseconds = remainingTime % 1000;

    // Display the countdown
    countdownDisplay.innerHTML = `${seconds} seconds and ${milliseconds} milliseconds remaining`;

    // Decrease the remaining time
    remainingTime -= 100; // Update every 100 milliseconds

    // Check if the countdown has finished
    if (remainingTime <= 0) {
      clearInterval(countdownInterval);
      countdownDisplay.innerHTML = "Time's up!";
    }
  }, 100); // Update every 100 milliseconds
}
