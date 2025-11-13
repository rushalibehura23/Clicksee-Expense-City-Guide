let navigationHistory = [];
let currentSelectedItem = null;

function updatePageTitle(title) {
  document.getElementById('pageTitle').textContent = title;
}

function updateBackButtonVisibility() {
  const backBtn = document.getElementById('backBtn');
  backBtn.classList.toggle('hidden', document.getElementById('loginPage').classList.contains('hidden') === false || navigationHistory.length <= 1);
}

function updateNavbarVisibility() {
  const navbar = document.getElementById('navbar');
  navbar.classList.toggle('hidden', document.getElementById('loginPage').classList.contains('hidden') === false);
}

async function handleLogin(event) {
  event.preventDefault();

  // --- keep your existing form elements ---
  const name = document.getElementById('name').value.trim();
  const phone = document.getElementById('phone').value.trim();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;

  // ✅ keep your existing validation logic (unchanged)
  if (!name || !phone || !email || !password) {
    alert('Please fill in all fields.');
    return;
  }

  // Optional validation (keep yours if already present)
  if (!/^[0-9]{10}$/.test(phone)) {
    alert('Please enter a valid 10-digit phone number.');
    return;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    alert('Please enter a valid email address.');
    return;
  }

  // --- ✨ new backend integration (safe addition) ---
  try {
    const response = await fetch('backend/register.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, phone, email, password })
    });

    const data = await response.json();

    if (!response.ok) {
      // Show server error message if any
      alert(data.error || 'Registration failed. Please try again.');
      return;
    }

    // ✅ success: call your existing navigation
    alert(data.message || 'Signup successful!');
    goToDistricts(); // ⚡ keep your existing function
  } catch (error) {
    console.error('Error:', error);
    alert('Unable to connect to the server. Please try again later.');
  }
}

function handleGoogleLogin() {
  alert('Google login initiated. This feature requires backend integration.');
  goToDistricts();
}

function goToDistricts() {
  document.querySelectorAll('.container').forEach(el => el.classList.add('hidden'));
  document.getElementById('districtsPage').classList.remove('hidden');
  navigationHistory.push('districtsPage');
  updatePageTitle('Select a District');
  updateBackButtonVisibility();
  updateNavbarVisibility();
}

function showAboutUs() {
  document.querySelectorAll('.container').forEach(el => el.classList.add('hidden'));
  document.getElementById('aboutUsPage').classList.remove('hidden');
  navigationHistory.push('aboutUsPage');
  updatePageTitle('About Us');
  updateBackButtonVisibility();
  updateNavbarVisibility();
}

function showContactUs() {
  document.querySelectorAll('.container').forEach(el => el.classList.add('hidden'));
  document.getElementById('contactUsPage').classList.remove('hidden');
  navigationHistory.push('contactUsPage');
  updatePageTitle('Contact Us');
  updateBackButtonVisibility();
  updateNavbarVisibility();
}

function showDistrict(districtName) {
  const district = districts.find(d => d.name === districtName);
  if (!district) return;

  document.getElementById('districtTitle').textContent = district.name;
  document.getElementById('districtImage').src = district.image;
  document.getElementById('districtDescription').textContent = district.description;

  const instituteContainer = document.getElementById('instituteCards');
  instituteContainer.innerHTML = '';

  if (district.institutes && district.institutes.length > 0) {
    document.getElementById('instituteHeading').classList.remove('hidden');
    district.institutes.forEach(inst => {
      const card = document.createElement('div');
      card.className = 'card';
      card.onclick = () => showInstitute(district.name, inst.name);
      card.innerHTML = `<img src="${inst.image}" alt="${inst.name}"><p>${inst.name}</p>`;
      instituteContainer.appendChild(card);
    });
  } else {
    document.getElementById('instituteHeading').classList.add('hidden');
  }

  document.querySelectorAll('.container').forEach(el => el.classList.add('hidden'));
  document.getElementById('districtDetailPage').classList.remove('hidden');
  navigationHistory.push('districtDetailPage');
  updatePageTitle(district.name);
  updateBackButtonVisibility();
  updateNavbarVisibility();
}

function showInstitute(districtName, instituteName) {
  const district = districts.find(d => d.name === districtName);
  const institute = district?.institutes.find(i => i.name === instituteName);
  if (!institute) return;

  document.getElementById('instituteTitle').textContent = institute.name;
  document.getElementById('instituteImage').src = institute.image;

  document.getElementById('instituteInfo').innerHTML = `
    <p><strong>Tuition Fees:</strong> ${institute.details.tuition}</p>
    <p><strong>Living Cost:</strong> ${institute.details.living}</p>
    <p><strong>Nearest PG:</strong> ${institute.details.nearestPG}</p>
    <p><strong>Nearest Restaurants:</strong> ${institute.details.nearestRestaurants}</p>
    <p><strong>Nearest Bus Stop:</strong> ${institute.details.nearestBusStop}</p>
  `;

  document.querySelectorAll('.container').forEach(el => el.classList.add('hidden'));
  document.getElementById('instituteDetailPage').classList.remove('hidden');
  navigationHistory.push('instituteDetailPage');
  updatePageTitle(institute.name);
  updateBackButtonVisibility();
  updateNavbarVisibility();
}

function showExpenseCalculator(districtName) {
  const district = districts.find(d => d.name === districtName);
  if (!district) return;

  const selector = document.getElementById('expenseSelector');
  selector.innerHTML = `<option value="">-- Select --</option>`;

  if (district.institutes) {
    district.institutes.forEach(inst => {
      const opt = document.createElement('option');
      opt.value = `inst|${inst.name}`;
      opt.textContent = `Institute: ${inst.name}`;
      selector.appendChild(opt);
    });
  }

  if (district.name.includes("Bhubaneswar")) {
    itCompanies.forEach(company => {
      const opt = document.createElement('option');
      opt.value = `it|${company.name}`;
      opt.textContent = `IT Company: ${company.name}`;
      selector.appendChild(opt);
    });
  }

  document.querySelectorAll('.container').forEach(el => el.classList.add('hidden'));
  document.getElementById('expenseCalculator').classList.remove('hidden');
  navigationHistory.push('expenseCalculator');
  updatePageTitle('Expense Calculator');
  updateBackButtonVisibility();
  updateNavbarVisibility();
}

function calculateExpenses() {
  const selector = document.getElementById('expenseSelector');
  const selectedValue = selector.value;
  const budget = Number(document.getElementById('monthlyBudget').value);

  if (!selectedValue) return alert("Please select an institute or IT company.");
  if (!budget || budget <= 0) return alert("Enter a valid monthly budget.");

  let totalCost = 0;
  let infoText = "";

  if (selectedValue.startsWith("inst|")) {
    const instName = selectedValue.split("|")[1];
    let institute;
    districts.forEach(d => {
      const found = d.institutes.find(i => i.name === instName);
      if (found) institute = found;
    });

    if (!institute) return;

    const livingMatch = institute.details.living.match(/₹(\d+)k/gi);
    const tuitionMatch = institute.details.tuition.match(/₹(\d+)(k)?/gi);

    let avgLiving = 0, avgTuition = 0;

    if (livingMatch) {
      const livingCosts = livingMatch.map(s => parseInt(s.replace(/₹|k/gi,''))*1000);
      avgLiving = livingCosts.reduce((a,b)=>a+b,0)/livingCosts.length;
    }

    if (tuitionMatch) {
      const tuitionCosts = tuitionMatch.map(s => parseInt(s.replace(/₹|k/gi,''))*1000);
      avgTuition = tuitionCosts.reduce((a,b)=>a+b,0)/tuitionCosts.length;
    }

    totalCost = avgLiving + avgTuition;
    infoText = `<p><strong>${institute.name}</strong></p>
                <p>Estimated Living Cost: ₹${avgLiving.toLocaleString()}</p>
                <p>Tuition Fees: ₹${avgTuition.toLocaleString()}</p>`;
  } else if (selectedValue.startsWith("it|")) {
    const companyName = selectedValue.split("|")[1];
    const company = itCompanies.find(c => c.name === companyName);
    if (!company) return;

    totalCost = company.monthlyCost;
    infoText = `<p><strong>${company.name}</strong></p>
                <p>Estimated Monthly Expenses: ₹${company.monthlyCost.toLocaleString()}</p>`;
  }

  const remaining = budget - totalCost;

  infoText += `<p><strong>Total Estimated Cost:</strong> ₹${totalCost.toLocaleString()}</p>
               <p><strong>Budget Remaining:</strong> ₹${remaining.toLocaleString()}</p>`;

  document.getElementById('expenseResult').innerHTML = infoText;
}

function showMaps() {
  const selector = document.getElementById('expenseSelector');
  const selectedValue = selector.value;

  if (!selectedValue) return alert("Please select an institute or IT company.");

  let selectedItem;

  if (selectedValue.startsWith("inst|")) {
    const instName = selectedValue.split("|")[1];
    districts.forEach(d => {
      const found = d.institutes.find(i => i.name === instName);
      if (found) selectedItem = found;
    });
  } else if (selectedValue.startsWith("it|")) {
    const companyName = selectedValue.split("|")[1];
    selectedItem = itCompanies.find(c => c.name === companyName);
  }

  if (!selectedItem || !selectedItem.details) return alert("No map data available for the selected item.");

  currentSelectedItem = selectedItem;

  document.querySelectorAll('.container').forEach(el => el.classList.add('hidden'));
  document.getElementById('mapsPage').classList.remove('hidden');
  navigationHistory.push('mapsPage');
  updatePageTitle('Nearby Maps');
  updateBackButtonVisibility();
  updateNavbarVisibility();

  initMaps(selectedItem);
}

function initMaps(item) {
  if (!item.details.lat || !item.details.lng) {
    console.error('No coordinates available for the selected item.');
    return;
  }

  const center = [item.details.lat, item.details.lng];

  // Restaurants Map
  const restaurantsMap = L.map('restaurantsMap').setView(center, 15);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(restaurantsMap);
  L.marker(center, {
    icon: L.icon({
      iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41]
    })
  }).addTo(restaurantsMap).bindPopup(item.name);
  const restaurants = item.details.nearestLocations.filter(loc => loc.type === 'Restaurant');
  restaurants.forEach(loc => {
    L.marker([loc.lat, loc.lng], {
      icon: L.icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-yellow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41]
      })
    }).addTo(restaurantsMap).bindPopup(loc.name);
  });

  // Bus Stops Map
  const busStopsMap = L.map('busStopsMap').setView(center, 15);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(busStopsMap);
  L.marker(center, {
    icon: L.icon({
      iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41]
    })
  }).addTo(busStopsMap).bindPopup(item.name);
  const busStops = item.details.nearestLocations.filter(loc => loc.type === 'Bus Stop');
  busStops.forEach(loc => {
    L.marker([loc.lat, loc.lng], {
      icon: L.icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-violet.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41]
      })
    }).addTo(busStopsMap).bindPopup(loc.name);
  });

  // PGs Map
  const pgsMap = L.map('pgsMap').setView(center, 15);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(pgsMap);
  L.marker(center, {
    icon: L.icon({
      iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41]
    })
  }).addTo(pgsMap).bindPopup(item.name);
  const pgs = item.details.nearestLocations.filter(loc => loc.type === 'PG');
  pgs.forEach(loc => {
    L.marker([loc.lat, loc.lng], {
      icon: L.icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41]
      })
    }).addTo(pgsMap).bindPopup(loc.name);
  });
}

function goBack() {
  if (navigationHistory.length <= 1) return;

  const currentPage = navigationHistory.pop();
  const previousPage = navigationHistory[navigationHistory.length - 1];

  document.querySelectorAll('.container').forEach(el => el.classList.add('hidden'));
  document.getElementById(previousPage).classList.remove('hidden');

  if (previousPage === 'districtsPage') {
    updatePageTitle('Select a District');
  } else if (previousPage === 'districtDetailPage') {
    updatePageTitle(document.getElementById('districtTitle').textContent);
  } else if (previousPage === 'instituteDetailPage') {
    updatePageTitle(document.getElementById('instituteTitle').textContent);
  } else if (previousPage === 'expenseCalculator') {
    updatePageTitle('Expense Calculator');
  } else if (previousPage === 'aboutUsPage') {
    updatePageTitle('About Us');
  } else if (previousPage === 'contactUsPage') {
    updatePageTitle('Contact Us');
  } else if (previousPage === 'mapsPage') {
    updatePageTitle('Nearby Maps');
  }

  updateBackButtonVisibility();
  updateNavbarVisibility();
}

const itCompanies = [
  {
    name: "Infosys",
    monthlyCost: 15000,
    details: {
      lat: 20.3447,
      lng: 85.8038,
      nearestLocations: [
  // 5 PGs (best near Infocity/Infosys; AC, Wi-Fi, food included)
  { type: 'PG', name: 'VYHOME Luxury PG (Boys)', lat: 20.3420, lng: 85.8020 },
  { type: 'PG', name: 'NAMASTAY PG (Mixed)', lat: 20.3450, lng: 85.8050 },
  { type: 'PG', name: 'Dibyanshi Ladies VIP PG', lat: 20.3435, lng: 85.8035 },
  { type: 'PG', name: 'Sriram Boys PG', lat: 20.3410, lng: 85.8010 },
  { type: 'PG', name: 'HelloWorld Spectacle (Boys)', lat: 20.3440, lng: 85.8045 },

  // 6 Restaurants (top-rated near Infocity; 4+ stars on Zomato/TripAdvisor)
  { type: 'Restaurant', name: 'Havana Cafe and Resto', lat: 20.3445, lng: 85.8040 },
  { type: 'Restaurant', name: 'Barbeque Nation', lat: 20.3450, lng: 85.8100 },
  { type: 'Restaurant', name: 'Marwari Rasoi Stone Palace', lat: 20.3430, lng: 85.8025 },
  { type: 'Restaurant', name: 'Golden Dine (Multi-Cuisine)', lat: 20.3460, lng: 85.8070 },
  { type: 'Restaurant', name: 'Scholars Restaurant', lat: 20.3440, lng: 85.8045 },
  { type: 'Restaurant', name: 'Mojo Cafe', lat: 20.3425, lng: 85.8030 },

  // 3 Nearest Mo Bus Stops (All <1 km; Routes 12/15)
  { type: 'Bus Stop', name: 'Infocity Square', lat: 20.3447, lng: 85.8038 },
  { type: 'Bus Stop', name: 'Infosys Square', lat: 20.3440, lng: 85.8040 },
  { type: 'Bus Stop', name: 'Patia Square', lat: 20.3590, lng: 85.8340 }
]
    }
  },
  {
    name: "TCS",
    monthlyCost: 14000,
    details: {
      lat: 20.3484,
      lng: 85.8060,
      nearestLocations: [
  // 5 PGs (best near Chandrasekharpur/TCS; AC, Wi-Fi, food included)
  { type: 'PG', name: 'VYHOME Luxury PG (Boys)', lat: 20.3460, lng: 85.8040 },
  { type: 'PG', name: 'HelloWorld Aspire (Mixed)', lat: 20.3470, lng: 85.8050 },
  { type: 'PG', name: 'Mishra Hostel (Boys)', lat: 20.3490, lng: 85.8070 },
  { type: 'PG', name: 'Sai Girls Hostel', lat: 20.3450, lng: 85.8030 },
  { type: 'PG', name: 'GoShelter 007 Olive (Boys)', lat: 20.3480, lng: 85.8060 },

  // 6 Restaurants (top-rated near Chandrasekharpur; 4+ stars on Zomato/TripAdvisor)
  { type: 'Restaurant', name: 'Golden Dine (Multi-Cuisine)', lat: 20.3470, lng: 85.8050 },
  { type: 'Restaurant', name: 'Kake Da Minar (Punjabi)', lat: 20.3500, lng: 85.8100 },
  { type: 'Restaurant', name: 'Barbeque Nation', lat: 20.3510, lng: 85.8110 },
  { type: 'Restaurant', name: 'The Urban Canteen (Chinese/North Indian)', lat: 20.3465, lng: 85.8045 },
  { type: 'Restaurant', name: 'Marwari Rasoi Stone Palace', lat: 20.3490, lng: 85.8080 },
  { type: 'Restaurant', name: 'Mojo Cafe', lat: 20.3475, lng: 85.8055 },

  // 3 Nearest Mo Bus Stops (All <1 km; Routes 12/15)
  { type: 'Bus Stop', name: 'TCS Square', lat: 20.3484, lng: 85.8060 },
  { type: 'Bus Stop', name: 'Chandrasekharpur PS', lat: 20.3480, lng: 85.8060 },
  { type: 'Bus Stop', name: 'Damana Square', lat: 20.3450, lng: 85.8030 }
]
    }
  },
  {
    name: "Wipro",
    monthlyCost: 13000,
    details: {
      lat: 20.3436,
      lng: 85.8039,
      nearestLocations: [
  // 5 PGs (best near Infocity/Wipro; AC, Wi-Fi, food included)
  { type: 'PG', name: 'VYHOME Luxury PG (Boys)', lat: 20.3420, lng: 85.8020 },
  { type: 'PG', name: 'NAMASTAY PG (Mixed)', lat: 20.3450, lng: 85.8050 },
  { type: 'PG', name: 'Dibyanshi Ladies VIP PG', lat: 20.3435, lng: 85.8035 },
  { type: 'PG', name: 'Sriram Boys PG', lat: 20.3410, lng: 85.8010 },
  { type: 'PG', name: 'HelloWorld Spectacle (Boys)', lat: 20.3440, lng: 85.8045 },

  // 6 Restaurants (top-rated near Infocity; 4+ stars on Zomato/TripAdvisor)
  { type: 'Restaurant', name: 'Havana Cafe and Resto', lat: 20.3445, lng: 85.8040 },
  { type: 'Restaurant', name: 'Barbeque Nation', lat: 20.3450, lng: 85.8100 },
  { type: 'Restaurant', name: 'Marwari Rasoi Stone Palace', lat: 20.3430, lng: 85.8025 },
  { type: 'Restaurant', name: 'Golden Dine (Multi-Cuisine)', lat: 20.3460, lng: 85.8070 },
  { type: 'Restaurant', name: 'Scholars Restaurant', lat: 20.3440, lng: 85.8045 },
  { type: 'Restaurant', name: 'Mojo Cafe', lat: 20.3425, lng: 85.8030 },

  // 3 Nearest Mo Bus Stops (All <1 km; Routes 12/15)
  { type: 'Bus Stop', name: 'Infocity Square', lat: 20.3447, lng: 85.8038 },
  { type: 'Bus Stop', name: 'Wipro Square', lat: 20.3436, lng: 85.8039 },
  { type: 'Bus Stop', name: 'Patia Square', lat: 20.3590, lng: 85.8340 }
]
    }
  },
  {
    name: "Mindfire Solutions",
    monthlyCost: 12000,
    details: {
      lat: 20.3447,
      lng: 85.8038,
      nearestLocations: [
  // 5 PGs (best near Infocity/Mindfire; AC, Wi-Fi, food included)
  { type: 'PG', name: 'VYHOME Luxury PG (Boys)', lat: 20.3420, lng: 85.8020 },
  { type: 'PG', name: 'NAMASTAY PG (Mixed)', lat: 20.3450, lng: 85.8050 },
  { type: 'PG', name: 'Dibyanshi Ladies VIP PG', lat: 20.3435, lng: 85.8035 },
  { type: 'PG', name: 'Sriram Boys PG', lat: 20.3410, lng: 85.8010 },
  { type: 'PG', name: 'Boys PG Infocity', lat: 20.3460, lng: 85.8060 },

  // 6 Restaurants (top-rated near Infocity; 4+ stars on Zomato/TripAdvisor)
  { type: 'Restaurant', name: 'Havana Cafe and Resto', lat: 20.3445, lng: 85.8040 },
  { type: 'Restaurant', name: 'Barbeque Nation', lat: 20.3450, lng: 85.8100 },
  { type: 'Restaurant', name: 'Marwari Rasoi Stone Palace', lat: 20.3430, lng: 85.8025 },
  { type: 'Restaurant', name: 'Golden Dine (Multi-Cuisine)', lat: 20.3460, lng: 85.8070 },
  { type: 'Restaurant', name: 'Scholars Restaurant', lat: 20.3440, lng: 85.8045 },
  { type: 'Restaurant', name: 'Mojo Cafe', lat: 20.3425, lng: 85.8030 },

  // 3 Nearest Mo Bus Stops (All <1 km; Routes 12/15)
  { type: 'Bus Stop', name: 'Infocity Square', lat: 20.3447, lng: 85.8038 },
  { type: 'Bus Stop', name: 'KIIT Square', lat: 20.3530, lng: 85.8200 },
  { type: 'Bus Stop', name: 'Patia Square', lat: 20.3590, lng: 85.8340 }
]
    }
  },
  {
    name: "Tech Mahindra",
    monthlyCost: 15000,
    details: {
      lat: 20.3111,
      lng: 85.8165,
      nearestLocations: [
  // 7 PGs (best near Chandrasekharpur/Tech Mahindra; AC, Wi-Fi, food included)
  { type: 'PG', name: 'HelloWorld Aspire (Mixed)', lat: 20.3090, lng: 85.8140 },
  { type: 'PG', name: 'VYHOME Luxury PG (Boys)', lat: 20.3100, lng: 85.8150 },
  { type: 'PG', name: 'Mishra Hostel (Boys)', lat: 20.3120, lng: 85.8170 },
  { type: 'PG', name: 'Sai Girls Hostel', lat: 20.3080, lng: 85.8130 },
  { type: 'PG', name: 'GoShelter 007 Olive (Boys)', lat: 20.3110, lng: 85.8160 },
  { type: 'PG', name: 'Urbanite Corporate PG', lat: 20.3105, lng: 85.8155 },
  { type: 'PG', name: 'Elite Girls Hostel', lat: 20.3070, lng: 85.8120 },

  // 9 Restaurants (top-rated near Chandrasekharpur; 4+ stars on Zomato/TripAdvisor)
  { type: 'Restaurant', name: 'Golden Dine (Multi-Cuisine)', lat: 20.3100, lng: 85.8150 },
  { type: 'Restaurant', name: 'Kake Da Minar (Punjabi)', lat: 20.3130, lng: 85.8180 },
  { type: 'Restaurant', name: 'Barbeque Nation', lat: 20.3140, lng: 85.8190 },
  { type: 'Restaurant', name: 'The Urban Canteen (Chinese/North Indian)', lat: 20.3095, lng: 85.8145 },
  { type: 'Restaurant', name: 'Marwari Rasoi Stone Palace', lat: 20.3115, lng: 85.8165 },
  { type: 'Restaurant', name: 'Hang Out (Chinese/Indian)', lat: 20.3085, lng: 85.8135 },
  { type: 'Restaurant', name: 'Scholars Restaurant', lat: 20.3125, lng: 85.8175 },
  { type: 'Restaurant', name: 'Mojo Cafe', lat: 20.3105, lng: 85.8155 },
  { type: 'Restaurant', name: 'CCD Chandrasekharpur', lat: 20.3135, lng: 85.8185 },

  // 4 Mo Bus Stops (All <2 km; Routes 12/15)
  { type: 'Bus Stop', name: 'Chandrasekharpur PS', lat: 20.3110, lng: 85.8160 },
  { type: 'Bus Stop', name: 'Tech Mahindra Square', lat: 20.3111, lng: 85.8165 },
  { type: 'Bus Stop', name: 'Omfed Square Chandrasekharpur', lat: 20.3130, lng: 85.8180 },
  { type: 'Bus Stop', name: 'Damana Square', lat: 20.3080, lng: 85.8130 }
]
    }
  }
];

const districts = [
  {
    name: 'Bhubaneswar',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/Bhubaneswar_skyline_121224.jpg/330px-Bhubaneswar_skyline_121224.jpg',
    description: 'Bhubaneswar, the capital of Odisha, is known as the Temple City and a major education + IT hub.',
    institutes: [
      {
        name: 'Utkal University',
        image: 'https://utkaluniversity.ac.in/wp-content/uploads/2022/01/utkalgate.png',
        details: {
          tuition: '₹5k-7k/month',
          living: '₹8k–12k/month',
          nearestPG: 'Acharya Vihar (1 km)',
          nearestRestaurants: 'Domino’s, Truptee',
          nearestBusStop: 'Vani Vihar (500 m)',
          lat: 20.3040,
          lng: 85.8396,
          nearestLocations: [
            { type: 'PG', name: 'Acharya Vihar (1 km)', lat: 20.2947, lng: 85.8294 },
            { type: 'Restaurant', name: 'Domino’s', lat: 20.2990, lng: 85.8260 },
            { type: 'Restaurant', name: 'Truptee', lat: 20.2760, lng: 85.8450 },
            { type: 'Bus Stop', name: 'Vani Vihar (500 m)', lat: 20.2965, lng: 85.8432 }
          ]
        }
      },
      {
        name: 'KIIT University',
        image: 'https://kiit.ac.in/wp-content/uploads/2018/07/KIIT-Campus-Front-Library.jpg',
        details: {
          tuition: '₹50k/month',
          living: '₹12k–18k/month',
          nearestPG: 'Patia PG',
          nearestRestaurants: 'CCD, Absolute BBQ',
          nearestBusStop: 'KIIT Square (200 m)',
          lat: 20.3528,
          lng: 85.8194,
          nearestLocations: [
  // 7 PGs
                { type: 'PG', name: 'Patia PG', lat: 20.3588, lng: 85.8333 },
                { type: 'PG', name: 'KIIT Boys Hostel PG', lat: 20.3520, lng: 85.8185 },
                { type: 'PG', name: 'Nandan Kanan PG', lat: 20.3560, lng: 85.8250 },
                { type: 'PG', name: 'Sai PG', lat: 20.3510, lng: 85.8205 },
                { type: 'PG', name: 'Green Valley PG', lat: 20.3545, lng: 85.8170 },
                { type: 'PG', name: 'KIIT Girls PG', lat: 20.3535, lng: 85.8190 },
                { type: 'PG', name: 'Shree PG', lat: 20.3505, lng: 85.8215 },

  // 9 Restaurants (Dalma & Momo Zone removed — replaced with better ones)
                { type: 'Restaurant', name: 'Cafe Coffee Day', lat: 20.3530, lng: 85.8220 },
                { type: 'Restaurant', name: 'Absolute Barbecue', lat: 20.3500, lng: 85.8200 },
                { type: 'Restaurant', name: 'Pizza Hut', lat: 20.3550, lng: 85.8210 },
                { type: 'Restaurant', name: 'KFC', lat: 20.3540, lng: 85.8230 },
                { type: 'Restaurant', name: 'Subway', lat: 20.3565, lng: 85.8240 },
                { type: 'Restaurant', name: 'Trupti Restaurant', lat: 20.3510, lng: 85.8175 },
                { type: 'Restaurant', name: 'Food Court KIIT', lat: 20.3528, lng: 85.8194 },
                { type: 'Restaurant', name: 'The Zaika', lat: 20.3545, lng: 85.8225 },
                { type: 'Restaurant', name: 'Café Coffee Day (Campus)', lat: 20.3525, lng: 85.8190 },

                // 4 Bus Stops (Last: KIIMS Hospital)
                { type: 'Bus Stop', name: 'KIIT Square (200 m)', lat: 20.3530, lng: 85.8200 },
                { type: 'Bus Stop', name: 'Patia Bus Stop', lat: 20.34241196417052, lng: 85.82281441783651 },
                { type: 'Bus Stop', name: 'KIIT Campus Gate', lat: 20.3528, lng: 85.8194 },
                { type: 'Bus Stop', name: 'KIIMS Hospital Bus Stop', lat:20.353977,lng: 85.813745 }
          ]
        }
      },
      {
        name: 'SOA (ITER)',
        image: 'https://images.squarespace-cdn.com/content/57713a8e2994cae381dd86fe/1655729453895-BJ96ANKG3W7H9RYLY44C/ITER+1.jpg?format=1500w&content-type=image%2Fjpeg',
        details: {
          tuition: '₹40k/month',
          living: '₹10k–15k/month',
          nearestPG: 'Jagamara PG',
          nearestRestaurants: 'Domino’s ITER',
          nearestBusStop: 'ITER Square (300 m)',
          lat: 20.2590,
          lng: 85.7914,
          nearestLocations:  [
  // 7 PGs (near Jagamara/ITER)
          { type: 'PG', name: 'Somli Hostel PG', lat: 20.2570, lng: 85.7890 },
          { type: 'PG', name: 'Kunal Boys PG', lat: 20.2560, lng: 85.7900 },
          { type: 'PG', name: 'Near ITER College PG', lat: 20.2580, lng: 85.7920 },
          { type: 'PG', name: 'Jagamara Girls PG', lat: 20.2550, lng: 85.7880 },
          { type: 'PG', name: 'Devi Hostel PG', lat: 20.2590, lng: 85.7910 },
          { type: 'PG', name: 'Urban Nest PG', lat: 20.2540, lng: 85.7870 },
          { type: 'PG', name: 'Khandagiri PG', lat: 20.2600, lng: 85.7930 },

          // 9 Restaurants (popular near ITER/Jagamara)
          { type: 'Restaurant', name: 'Scholars Restaurant', lat: 20.2585, lng: 85.7905 },
          { type: 'Restaurant', name: 'Sabooz Restaurant', lat: 20.2575, lng: 85.7895 },
          { type: 'Restaurant', name: 'Jagamara Food Park', lat: 20.2595, lng: 85.7925 },
          { type: 'Restaurant', name: 'Paratha Junction', lat: 20.2565, lng: 85.7885 },
          { type: 'Restaurant', name: 'Laziz Pizza', lat: 20.2605, lng: 85.7935 },
          { type: 'Restaurant', name: 'Moody Blues', lat: 20.2555, lng: 85.7875 },
          { type: 'Restaurant', name: 'Tandoori & Kebab', lat: 20.2580, lng: 85.7915 },
          { type: 'Restaurant', name: 'Chicken Bar Stall', lat: 20.2570, lng: 85.7890 },
          { type: 'Restaurant', name: 'ITER Chowk Cafe', lat: 20.2590, lng: 85.7920 },

          // 4 Bus Stops – last one is **actually near ITER**
          { type: 'Bus Stop', name: 'ITER Square (300 m)', lat: 20.2590, lng: 85.7914 },
          { type: 'Bus Stop', name: 'Jagamara Square', lat: 20.2550, lng: 85.7850 },
          { type: 'Bus Stop', name: 'Khandagiri Square', lat: 20.2610, lng: 85.7940 },
          { type: 'Bus Stop', name: 'Khandagiri Bus Stand', lat: 20.2635, lng: 85.7932 }
            ]
        }
      },
      {
        name: 'IIIT Bhubaneswar',
        image: 'https://images.odishatv.in/uploadimage/library/16_9/16_9_0/IMAGE_1654842192.jpg',
        details: {
          tuition: '₹7k/month',
          living: '₹8k–12k/month',
          nearestPG: 'Gothapatna PG',
          nearestRestaurants: 'Cafeteria',
          nearestBusStop: 'IIIT Gate',
          lat: 20.2949,
          lng: 85.7436,
          nearestLocations: [
                    // 7 PGs (near Gothapatna/IIIT)
                    { type: 'PG', name: 'Gothapatna PG', lat: 20.2920, lng: 85.7420 },
                    { type: 'PG', name: 'Malipada Boys PG', lat: 20.2930, lng: 85.7440 },
                    { type: 'PG', name: 'IIIT Gate PG', lat: 20.2945, lng: 85.7430 },
                    { type: 'PG', name: 'Shampur Girls PG', lat: 20.2910, lng: 85.7410 },
                    { type: 'PG', name: 'Nuagaon PG', lat: 20.2950, lng: 85.7450 },
                    { type: 'PG', name: 'Raghunathpur PG', lat: 20.2900, lng: 85.7400 },
                    { type: 'PG', name: 'Devi Hostel PG', lat: 20.2960, lng: 85.7460 },

                    // 9 Restaurants (popular near IIIT/Gothapatna; no Dalma/Momo Zone)
                    { type: 'Restaurant', name: 'Food Fantasy (F2 Point)', lat: 20.2940, lng: 85.7435 },
                    { type: 'Restaurant', name: 'Silly Belly', lat: 20.2950, lng: 85.7445 },
                    { type: 'Restaurant', name: 'Shawarma Xpress', lat: 20.2935, lng: 85.7425 },
                    { type: 'Restaurant', name: 'Zage 3 Restro Cafe', lat: 20.2925, lng: 85.7415 },
                    { type: 'Restaurant', name: 'PP Hotel & Restaurant', lat: 20.2965, lng: 85.7455 },
                    { type: 'Restaurant', name: 'Cafeteria IIIT', lat: 20.2949, lng: 85.7436 },
                    { type: 'Restaurant', name: 'Nakli Dhaba', lat: 20.2915, lng: 85.7405 },
                    { type: 'Restaurant', name: 'Marwari Rasoi', lat: 20.2955, lng: 85.7440 },
                    { type: 'Restaurant', name: 'Bling It On', lat: 20.2930, lng: 85.7420 },

                    // 4 Bus Stops (Mo Bus stops near IIIT; all local)
                    { type: 'Bus Stop', name: 'IIIT Gate', lat: 20.2949, lng: 85.7436 },
                    { type: 'Bus Stop', name: 'IIIT Square', lat: 20.2955, lng: 85.7440 },
                    { type: 'Bus Stop', name: 'Gothapatna Square', lat: 20.2920, lng: 85.7420 },
                    { type: 'Bus Stop', name: 'Paikraypur Road', lat: 20.2960, lng: 85.7450 }
                  ]
        }
      },
      {
        name: 'AIIMS Bhubaneswar',
        image: 'https://thesamikhsya.com/wp-content/uploads/2020/05/AIIMS-Bhubaneswar.jpg',
        details: {
          tuition: 'Low (Govt.)',
          living: '₹6k–10k/month',
          nearestPG: 'Patia',
          nearestRestaurants: 'CCD, Dhabas',
          nearestBusStop: 'AIIMS Stop',
          lat: 20.2311,
          lng: 85.7750,
       
       nearestLocations: [
                    // 7 PGs (best near Patrapada/Sathavara)
                    { type: 'PG', name: 'BBSR Hostel (Boys)', lat: 20.2350, lng: 85.7800 },
                    { type: 'PG', name: 'Patrapada Girls PG', lat: 20.2320, lng: 85.7760 },
                    { type: 'PG', name: 'Sathavara Student Hostel', lat: 20.2340, lng: 85.7790 },
                    { type: 'PG', name: 'AIIMS Road PG (Mixed)', lat: 20.2310, lng: 85.7755 },
                    { type: 'PG', name: 'Udayagiri Vihar PG', lat: 20.2360, lng: 85.7810 },
                    { type: 'PG', name: 'Dumduma Near AIIMS PG', lat: 20.2300, lng: 85.7740 },
                    { type: 'PG', name: 'Patia AIIMS Hostel', lat: 20.2335, lng: 85.7775 },

                    // 9 Top Restaurants (near AIIMS/Patia)
                    { type: 'Restaurant', name: 'Barbeque Nation', lat: 20.3500, lng: 85.8200 },
                    { type: 'Restaurant', name: 'Kake Di Hatti (Punjabi)', lat: 20.3000, lng: 85.8200 },
                    { type: 'Restaurant', name: 'Arabikaas (Middle Eastern)', lat: 20.3050, lng: 85.8250 },
                    { type: 'Restaurant', name: 'Beyrut Classy Dine', lat: 20.2950, lng: 85.8150 },
                    { type: 'Restaurant', name: 'Mayfair Lagoon', lat: 20.3400, lng: 85.8100 },
                    { type: 'Restaurant', name: 'Hotel Lemon Tree Premier', lat: 20.2900, lng: 85.8050 },
                    { type: 'Restaurant', name: 'CCD (Patia)', lat: 20.3530, lng: 85.8220 },
                    { type: 'Restaurant', name: 'Dhabas Near AIIMS', lat: 20.2325, lng: 85.7770 },
                    { type: 'Restaurant', name: 'Trupti (Odia/North Indian)', lat: 20.2760, lng: 85.8450 },

                    // 4 Nearest Mo Bus Stops (All < 3 km from AIIMS)
                    { type: 'Bus Stop', name: 'AIIMS Cell Tower', lat: 20.2330, lng: 85.7780 },
                    { type: 'Bus Stop', name: 'Patrapada Square', lat: 20.2355, lng: 85.7805 },
                    { type: 'Bus Stop', name: 'Sishu Bhawan Square', lat: 20.2315, lng: 85.7760 },
                    { type: 'Bus Stop', name: 'Dumduma Bus Stop', lat: 20.2290, lng: 85.7730 }
                  ]
        }
      },
      {
        name: 'Infosys Bhubaneswar',
        image: 'https://media.glassdoor.com/l/de/31/cc/e8/main-building.jpg?signature=3a30bca09ba250dc1be6965ad32accb4ada94e14d993cb118bec30ce125ca548',
        details: {
          tuition: 'N/A (Company)',
          living: '₹10k–15k/month nearby',
          nearestPG: 'Infocity Area PGs',
          nearestRestaurants: 'Infocity Food Court, CCD',
          nearestBusStop: 'Infocity Square',
          lat: 20.3447,
          lng: 85.8038,
          nearestLocations: [
// 7 PGs (best near Infocity/Chandrasekharpur; AC, Wi-Fi, food included)
              { type: 'PG', name: 'VYHOME Luxury PG (Boys)', lat: 20.3420, lng: 85.8020 },
              { type: 'PG', name: 'NAMASTAY PG (Mixed)', lat: 20.3450, lng: 85.8050 },
              { type: 'PG', name: 'Boys PG Infocity', lat: 20.3435, lng: 85.8035 },
              { type: 'PG', name: 'Sampark Smart Living (Girls)', lat: 20.3410, lng: 85.8010 },
              { type: 'PG', name: 'Paradise PG', lat: 20.3460, lng: 85.8060 },
              { type: 'PG', name: 'HelloWorld Spectacle (Boys)', lat: 20.3405, lng: 85.8005 },
              { type: 'PG', name: 'Divyanshi Homestay (Girls)', lat: 20.3445, lng: 85.8045 },

// 9 Restaurants 
              { type: 'Restaurant', name: 'Marwari Rasoi Stone Palace', lat: 20.3450, lng: 85.8100 },
              { type: 'Restaurant', name: 'Hi Bhubaneswar (Multi-Cuisine)', lat: 20.3500, lng: 85.8200 },
              { type: 'Restaurant', name: 'The Chocolate House', lat: 20.3430, lng: 85.8025 },
              { type: 'Restaurant', name: 'Hang Out (Chinese/Indian)', lat: 20.3460, lng: 85.8070 },
              { type: 'Restaurant', name: 'Scholars Restaurant', lat: 20.3445, lng: 85.8045 },
              { type: 'Restaurant', name: 'Mojo Cafe', lat: 20.3425, lng: 85.8030 },
              { type: 'Restaurant', name: 'Infocity Food Court', lat: 20.3440, lng: 85.8040 },
              { type: 'Restaurant', name: 'CCD Patia', lat: 20.3530, lng: 85.8220 },
              { type: 'Restaurant', name: 'Absolute Barbecue', lat: 20.3500, lng: 85.8200 },

 // 4 Mo Bus Stops 
              { type: 'Bus Stop', name: 'Infocity Square', lat: 20.3447, lng: 85.8038 },
              { type: 'Bus Stop', name: 'KIIT Square', lat: 20.3530, lng: 85.8200 },
              { type: 'Bus Stop', name: 'Patia Square', lat: 20.3590, lng: 85.8340 },
              { type: 'Bus Stop', name: 'Chandaka Industrial Estate', lat: 20.3420, lng: 85.8020 }
            ]
        }
      },
      {
        name: 'TCS Bhubaneswar',
        image: 'https://shapoorji.in/wp-content/uploads/2020/10/tcs_kalinga1-750x422.jpg',
        details: {
          tuition: 'N/A (Company)',
          living: '₹9k–13k/month nearby',
          nearestPG: 'Chandrasekharpur PGs',
          nearestRestaurants: 'Domino’s, Barbeque Nation',
          nearestBusStop: 'TCS Square',
          lat: 20.3484,
          lng: 85.8060,
          nearestLocations: [
            { type: 'PG', name: 'Chandrasekharpur PGs', lat: 20.3480, lng: 85.8060 },
            { type: 'Restaurant', name: 'Domino’s', lat: 20.3480, lng: 85.8060 },
            { type: 'Restaurant', name: 'Barbeque Nation', lat: 20.3480, lng: 85.8060 },
            { type: 'Bus Stop', name: 'TCS Square', lat: 20.3484, lng: 85.8060 }
          ]
        }
      },
      {
        name: 'Wipro Bhubaneswar',
        image: 'https://images.jdmagicbox.com/comp/bhubaneshwar/s2/0674px674.x674.180811003510.v3s2/catalogue/wipro-technologies-bhubaneswar-bhubaneshwar-software-companies-68vhi3d06q.jpg',
        details: {
          tuition: 'N/A (Company)',
          living: '₹9k–14k/month nearby',
          nearestPG: 'Infocity PGs',
          nearestRestaurants: 'CCD, Dhabas',
          nearestBusStop: 'Wipro Square',
          lat: 20.3436,
          lng: 85.8039,
          
         nearestLocations: [
                  // 7 PGs (best near Chandrasekharpur/TCS; AC, Wi-Fi, food included)
                  { type: 'PG', name: 'VYHOME Luxury PG (Boys)', lat: 20.3460, lng: 85.8040 },
                  { type: 'PG', name: 'HelloWorld Aspire (Mixed)', lat: 20.3470, lng: 85.8050 },
                  { type: 'PG', name: 'Mishra Hostel (Boys)', lat: 20.3490, lng: 85.8070 },
                  { type: 'PG', name: 'Sai Girls Hostel', lat: 20.3450, lng: 85.8030 },
                  { type: 'PG', name: 'GoShelter 007 Olive (Boys)', lat: 20.3480, lng: 85.8060 },
                  { type: 'PG', name: 'Urbanite Corporate PG', lat: 20.3475, lng: 85.8055 },
                  { type: 'PG', name: 'Elite Girls Hostel', lat: 20.3440, lng: 85.8020 },

                  // 9 Restaurants (top-rated near Chandrasekharpur; 4+ stars on Zomato/TripAdvisor)
                  { type: 'Restaurant', name: 'Golden Dine (Multi-Cuisine)', lat: 20.3470, lng: 85.8050 },
                  { type: 'Restaurant', name: 'Kake Da Minar (Punjabi)', lat: 20.3500, lng: 85.8100 },
                  { type: 'Restaurant', name: 'Barbeque Nation', lat: 20.3510, lng: 85.8110 },
                  { type: 'Restaurant', name: 'The Urban Canteen (Chinese/North Indian)', lat: 20.3465, lng: 85.8045 },
                  { type: 'Restaurant', name: 'Marwari Rasoi Stone Palace', lat: 20.3490, lng: 85.8080 },
                  { type: 'Restaurant', name: 'Hang Out (Chinese/Indian)', lat: 20.3455, lng: 85.8035 },
                  { type: 'Restaurant', name: 'Scholars Restaurant', lat: 20.3485, lng: 85.8065 },
                  { type: 'Restaurant', name: 'Mojo Cafe', lat: 20.3475, lng: 85.8055 },
                  { type: 'Restaurant', name: 'CCD Chandrasekharpur', lat: 20.3505, lng: 85.8090 },

                  // 4 Mo Bus Stops (All <2 km; Routes 12/15)
                  { type: 'Bus Stop', name: 'Chandrasekharpur PS', lat: 20.3480, lng: 85.8060 },
                  { type: 'Bus Stop', name: 'TCS Square', lat: 20.3484, lng: 85.8060 },
                  { type: 'Bus Stop', name: 'Omfed Square Chandrasekharpur', lat: 20.3500, lng: 85.8100 },
                  { type: 'Bus Stop', name: 'Damana Square', lat: 20.3450, lng: 85.8030 }
]
        }
      }
    ]
  },
  {
    name: 'Cuttack',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3d/2-barabati-stadium-cuttack-odisha-city-hero.jpg/1200px-2-barabati-stadium-cuttack-odisha-city-hero.jpg',
    description: 'Cuttack, the cultural capital of Odisha, is famous for its history and institutions.',
    institutes: [
      {
        name: 'SCB Medical College',
        image: 'https://res.cloudinary.com/driatiukm/image/upload/q_auto,f_auto,h_500,w_1500/v1727895793/ld50rcingx8wjlca48s6.png',
        details: {
          tuition: 'Govt fees (₹20k–30k/year)',
          living: '₹7k–10k/month',
          nearestPG: 'Mangalabag',
          nearestRestaurants: 'Aahar, Silver City',
          nearestBusStop: 'Badambadi Bus Stand'
        }
      }
    ]
  },
  {
    name: 'Baleswar',
    image: 'https://i.ytimg.com/vi/WYw_I6Ww_Ag/maxresdefault.jpg',
    description: 'Balasore is known for its Chandipur beach and DRDO missile testing center.',
    institutes: [
      {
        name: 'Fakir Mohan University',
        image: 'https://content.jdmagicbox.com/v2/comp/balasore/r9/9999p6782.6782.110212153406.w3r9/catalogue/fakir-mohan-autonomous-college-azimabad-balasore-science-colleges-L95eSIi0k2.jpg',
        details: {
          tuition: '₹25k–40k/year',
          living: '₹6k–9k/month',
          nearestPG: 'Remuna Golei',
          nearestRestaurants: 'Chandipur Dhaba, Hotel Nocci',
          nearestBusStop: 'Balasore Bus Stand'
        }
      }
    ]
  },
  {
    name: 'Rourkela',
    image: 'https://bloombergcities.jhu.edu/sites/default/files/2022-01/Rourkela%20image%202%5B5%5D.jpg',
    description: 'Rourkela, known as the Steel City of Odisha, is home to India’s first public sector steel plant and top institutes.',
    institutes: [
      {
        name: 'National Institute of Technology (NIT) Rourkela',
        image: 'https://images.indianexpress.com/2023/07/NIT-Rourkela.jpg',
        details: {
          tuition: '₹1.2L–1.5L/year',
          living: '₹10k–15k/month',
          nearestPG: 'Sector-2, Sector-3 (2 km)',
          nearestRestaurants: 'Domino’s, Hi-Tech Fast Food',
          nearestBusStop: 'Rourkela Bus Stand (3 km)'
        }
      },
      {
        name: 'Government College of Engineering, Rourkela (GCER)',
        image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/UGIE_Rourkela_Main_Campus.jpg/1200px-UGIE_Rourkela_Main_Campus.jpg',
        details: {
          tuition: '₹40k–60k/year',
          living: '₹8k–12k/month',
          nearestPG: 'Sector-14',
          nearestRestaurants: 'Omm Sai Restaurant',
          nearestBusStop: 'Panposh Chowk'
        }
      }
    ]
  },
  {
    name: 'Sambalpur',
    image: 'https://i.ytimg.com/vi/ZPVnKK7TDbo/maxresdefault.jpg',
    description: 'Sambalpur is famous for Hirakud Dam, Sambalpuri sarees, and its growing education sector.',
    institutes: [
      {
        name: 'Sambalpur University (Jyoti Vihar)',
        image: 'https://www.suniv.ac.in/images/university-gate.jpg',
        details: {
          tuition: '₹30k–50k/year',
          living: '₹7k–10k/month',
          nearestPG: 'Burla Town',
          nearestRestaurants: 'Campus Canteen, Burla Dhabas',
          nearestBusStop: 'Burla Bus Stand (1 km)'
        }
      },
      {
        name: 'Veer Surendra Sai University of Technology (VSSUT)',
        image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT6yOOhMGg2J14x2HkKLOmPg1cnsmC05W0uEw&s',
        details: {
          tuition: '₹80k–1L/year',
          living: '₹9k–13k/month',
          nearestPG: 'Burla Market',
          nearestRestaurants: 'Foodies Hub, Dhaba Junction',
          nearestBusStop: 'Burla Bus Stop (500 m)'
        }
      }
    ]
  }
];

const districtContainer = document.getElementById('districtCards');
districts.forEach(district => {
  const card = document.createElement('div');
  card.className = 'card';
  card.onclick = () => showDistrict(district.name);
  card.innerHTML = `<img src="${district.image}" alt="${district.name}"><p>${district.name}</p>`;
  districtContainer.appendChild(card);
});

const districtSearchInput = document.getElementById('districtSearch');
districtSearchInput.addEventListener('input', () => {
  const query = districtSearchInput.value.toLowerCase();
  const districtCards = document.querySelectorAll('#districtCards .card');
  districtCards.forEach(card => {
    const name = card.querySelector('p').textContent.toLowerCase();
    card.style.display = name.includes(query) ? 'block' : 'none';
  });
});

const instituteSearchInput = document.getElementById('instituteSearch');
instituteSearchInput.addEventListener('input', () => {
  const query = instituteSearchInput.value.toLowerCase();
  const instituteCards = document.querySelectorAll('#instituteCards .card');
  instituteCards.forEach(card => {
    const name = card.querySelector('p').textContent.toLowerCase();
    card.style.display = name.includes(query) ? 'block' : 'none';
  });
});

const darkToggle = document.getElementById("darkModeToggle");
darkToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark-mode");
  darkToggle.textContent = document.body.classList.contains("dark-mode")
    ? "☀️ Light Mode"
    : "🌙 Dark Mode";
});

const backBtn = document.getElementById("backBtn");
backBtn.addEventListener("click", goBack);

updateBackButtonVisibility();
updateNavbarVisibility();