// Exercises for each body part
const exercises = {
  Chest: ['Bench Press', 'Incline Bench', 'Chest Fly'],
  Back: ['Deadlift', 'Pull-Up', 'Barbell Row'],
  Legs: ['Squat', 'Leg Press', 'Lunges'],
  Shoulders: ['Shoulder Press', 'Lateral Raise', 'Front Raise'],
  Arms: ['Bicep Curl', 'Tricep Dip', 'Hammer Curl']
};

// Fetch the JWT token from localStorage
const token = localStorage.getItem('token');

// Redirect to login page if not logged in
if (!token) {
  window.location.href = 'home.html';  // Redirect to login if no token is found
}

// Show workout modal
document.getElementById('startWorkoutButton').addEventListener('click', function() {
  document.getElementById('workoutModal').style.display = 'flex';
});

// Close workout modal
document.getElementById('closeModal').addEventListener('click', function() {
  document.getElementById('workoutModal').style.display = 'none';
});

// Handle body part selection
document.querySelectorAll('.body-part').forEach(button => {
  button.addEventListener('click', function() {
      const bodyPart = button.getAttribute('data-part');
      document.getElementById('selectedBodyPart').innerText = bodyPart;

      // Populate the exercises dropdown
      const exerciseSelect = document.getElementById('exerciseSelect');
      exerciseSelect.innerHTML = ''; // Clear previous options
      exercises[bodyPart].forEach(exercise => {
          const option = document.createElement('option');
          option.value = exercise;
          option.textContent = exercise;
          exerciseSelect.appendChild(option);
      });

      // Show the exercise section
      document.getElementById('exerciseSection').classList.remove('hidden');
  });
});

// Handle workout submission
document.getElementById('submitExercise').addEventListener('click', async function() {
  const selectedExercise = document.getElementById('exerciseSelect').value;
  const liftWeight = parseFloat(document.getElementById('exerciseWeight').value);

  if (!liftWeight || isNaN(liftWeight)) {
      alert('Please enter a valid weight.');
      return;
  }

  // Save the new lift to the server using the API
  const response = await fetch('/api/workouts', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`  // Include the JWT token in the request
      },
      body: JSON.stringify({
          exercise: selectedExercise,
          weight: liftWeight
      })
  });

  const data = await response.json();

  if (response.ok) {
      alert(`Workout saved: ${selectedExercise} with ${liftWeight} lbs!`);
  } else {
      alert(`Error: ${data.error}`);
      return;
  }

  // Close the modal and reset form
  document.getElementById('workoutModal').style.display = 'none';
  document.getElementById('exerciseSection').classList.add('hidden');
  document.getElementById('exerciseWeight').value = '';

  // Update the chart after submission
  fetchAndUpdateChart();
});

// Function to update the chart with the latest data from the server
async function fetchAndUpdateChart() {
  const response = await fetch('/api/workouts', {
      method: 'GET',
      headers: {
          'Authorization': `Bearer ${token}`  // Include the JWT token in the request
      }
  });

  const lifts = await response.json();

  const ctx = document.getElementById('progressChart').getContext('2d');

  // Clear any existing chart if no data is present
  if (lifts.length === 0) {
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      document.getElementById('dataPointsList').innerHTML = "<li>No data available</li>";
      return;
  }

  // Extract data for the chart
  const liftData = lifts.map(lift => lift.weight);
  const liftLabels = lifts.map(lift => `${lift.exercise} (${new Date(lift.date).toLocaleDateString()})`);

  // Destroy previous chart instance if it exists
  if (window.myChart) {
      window.myChart.destroy();
  }

  // Create a new chart
  window.myChart = new Chart(ctx, {
      type: 'line',
      data: {
          labels: liftLabels,
          datasets: [{
              label: 'Weight Lifted (lbs)',
              data: liftData,
              borderColor: '#f44336',
              backgroundColor: 'rgba(244, 67, 54, 0.1)',
              borderWidth: 2,
          }]
      },
      options: {
          scales: {
              y: {
                  beginAtZero: true
              }
          }
      }
  });

  // Update the data point list with delete buttons
  updateDataPointsList(lifts);
}

// Update the data points list with delete buttons
function updateDataPointsList(lifts) {
  const dataPointsList = document.getElementById('dataPointsList');
  dataPointsList.innerHTML = ''; // Clear existing list

  lifts.forEach((lift, index) => {
      const listItem = document.createElement('li');
      listItem.innerHTML = `${lift.exercise} - ${lift.weight} lbs on ${new Date(lift.date).toLocaleDateString()} 
      <button onclick="deleteDataPoint(${lift.id})">Delete</button>`;
      dataPointsList.appendChild(listItem);
  });
}

// Handle the deletion of a data point from the server
async function deleteDataPoint(id) {
  const response = await fetch(`/api/workouts/${id}`, {
      method: 'DELETE',
      headers: {
          'Authorization': `Bearer ${token}`  // Include the JWT token in the request
      }
  });

  if (response.ok) {
      alert('Workout deleted successfully.');
      fetchAndUpdateChart();  // Update the chart after deletion
  } else {
      const data = await response.json();
      alert(`Error: ${data.error}`);
  }
}

// Initial chart rendering on page load
window.onload = function() {
  fetchAndUpdateChart();
};
