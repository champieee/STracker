// Fetch the JWT token from session (using PHP sessions instead)
const token = sessionStorage.getItem('user_id');

// Redirect to login page if not logged in
if (!token) {
  window.location.href = 'home.html';  // Redirect to login if no session is found
}

// Save the new lift to the server using the API
document.getElementById('submitExercise').addEventListener('click', async function() {
  const selectedExercise = document.getElementById('exerciseSelect').value;
  const liftWeight = parseFloat(document.getElementById('exerciseWeight').value);

  if (!liftWeight || isNaN(liftWeight)) {
    alert('Please enter a valid weight.');
    return;
  }

  const response = await fetch('addWorkout.php', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: `exercise=${selectedExercise}&weight=${liftWeight}`
  });

  const data = await response.json();

  if (response.ok) {
    alert(`Workout saved: ${selectedExercise} with ${liftWeight} lbs!`);
  } else {
    alert(`Error: ${data.error}`);
    return;
  }

  fetchAndUpdateChart();
});

// Function to fetch and update chart
async function fetchAndUpdateChart() {
  const response = await fetch('getWorkouts.php', { method: 'GET' });
  const lifts = await response.json();

  // Chart update logic here...
}
