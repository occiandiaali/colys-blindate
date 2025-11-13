export default function startCountdown(duration) {
  let timer = duration / 1000,
    minutes,
    seconds;

  const countdownInterval = setInterval(() => {
    minutes = parseInt(timer / 60, 10);
    seconds = parseInt(timer % 60, 10);

    // Format minutes and seconds to always show two digits
    minutes = minutes < 10 ? "0" + minutes : minutes;
    seconds = seconds < 10 ? "0" + seconds : seconds;

    // Display the countdown
    //console.log(minutes + ":" + seconds);

    // Stop the countdown when it reaches zero
    if (--timer < 0) {
      clearInterval(countdownInterval);
      console.log("Time's up!");
    }
  }, 1000);
  return `${minutes}:${seconds}`;
}

// Start a countdown of 5 minutes (300 seconds)
// divide by 1000 in the case of milliseconds argument
// startCountdown(300);
// const seconded = duration / 1000
// startCountdown(seconded)
