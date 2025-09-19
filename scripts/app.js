// const apiKey = 'e760d40b60fc82b10ac9aceb9a34c10a'; // Thay bằng API key của bạn
// API Configuration
const API_KEY = 'e760d40b60fc82b10ac9aceb9a34c10a'; // Thay thế bằng API key của bạn
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

// DOM Elements
const searchInput = document.getElementById('search-input');
const searchBtn = document.getElementById('search-btn');
const locationBtn = document.getElementById('location-btn');
const loadingEl = document.getElementById('loading');
const errorEl = document.getElementById('error');
const currentWeatherEl = document.getElementById('current-weather');
const forecastEl = document.getElementById('forecast');
const forecastContainer = document.getElementById('forecast-container');

// Event Listeners
searchBtn.addEventListener('click', handleSearch);
locationBtn.addEventListener('click', getLocationWeather);
searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleSearch();
});

// Hàm xử lý tìm kiếm
function handleSearch() {
    const city = searchInput.value.trim();
    if (city) {
        getWeatherData(city);
    } else {
        showError('Vui lòng nhập tên thành phố');
    }
}

// Hàm lấy thời tiết theo vị trí
function getLocationWeather() {
    if (!navigator.geolocation) {
        showError('Trình duyệt không hỗ trợ định vị');
        return;
    }
    
    showLoading();
    navigator.geolocation.getCurrentPosition(
        position => {
            const { latitude, longitude } = position.coords;
            getWeatherByCoords(latitude, longitude);
        },
        error => {
            showError('Không thể lấy vị trí: ' + error.message);
        }
    );
}

// Hàm lấy dữ liệu thời tiết theo tên thành phố
async function getWeatherData(city) {
    showLoading();
    hideError();
    
    try {
        // Kiểm tra dữ liệu trong cache trước
        const cachedData = Storage.getWeatherData(city);
        if (cachedData && !Storage.isDataExpired(cachedData.timestamp)) {
            displayWeatherData(cachedData.data);
            return;
        }
        
        // Nếu không có cache hoặc cache hết hạn, gọi API
        const [currentResponse, forecastResponse] = await Promise.all([
            fetch(`${BASE_URL}/weather?q=${city}&units=metric&appid=${API_KEY}`),
            fetch(`${BASE_URL}/forecast?q=${city}&units=metric&appid=${API_KEY}`)
        ]);
        
        if (!currentResponse.ok || !forecastResponse.ok) {
            throw new Error('Không tìm thấy thành phố');
        }
        
        const currentData = await currentResponse.json();
        const forecastData = await forecastResponse.json();
        
        const weatherData = {
            current: currentData,
            forecast: forecastData
        };
        
        // Lưu vào cache
        Storage.saveWeatherData(city, weatherData);
        
        // Hiển thị dữ liệu
        displayWeatherData(weatherData);
    } catch (error) {
        showError(error.message);
    }
}

// Hàm lấy dữ liệu thời tiết theo tọa độ
async function getWeatherByCoords(lat, lon) {
    try {
        const [currentResponse, forecastResponse] = await Promise.all([
            fetch(`${BASE_URL}/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`),
            fetch(`${BASE_URL}/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`)
        ]);
        
        if (!currentResponse.ok || !forecastResponse.ok) {
            throw new Error('Không thể lấy dữ liệu thời tiết');
        }
        
        const currentData = await currentResponse.json();
        const forecastData = await forecastResponse.json();
        
        const weatherData = {
            current: currentData,
            forecast: forecastData
        };
        
        // Lưu vào cache với key là tọa độ
        const cacheKey = `${lat},${lon}`;
        Storage.saveWeatherData(cacheKey, weatherData);
        
        // Hiển thị dữ liệu
        displayWeatherData(weatherData);
        searchInput.value = currentData.name; // Cập nhật ô tìm kiếm với tên thành phố
    } catch (error) {
        showError(error.message);
    }
}

// Hàm hiển thị dữ liệu thời tiết
function displayWeatherData(data) {
    hideLoading();
    displayCurrentWeather(data.current);
    displayForecast(data.forecast);
}

// Hàm hiển thị thời tiết hiện tại
function displayCurrentWeather(data) {
    document.getElementById('city-name').textContent = `${data.name}, ${data.sys.country}`;
    document.getElementById('current-temp').textContent = `${Math.round(data.main.temp)}°C`;
    document.getElementById('weather-desc').textContent = data.weather[0].description;
    document.getElementById('humidity').textContent = data.main.humidity;
    document.getElementById('wind-speed').textContent = data.wind.speed;
    document.getElementById('pressure').textContent = data.main.pressure;
    
    // Cập nhật icon
    const iconCode = data.weather[0].icon;
    document.getElementById('weather-icon').src = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
    document.getElementById('weather-icon').alt = data.weather[0].description;
    
    currentWeatherEl.classList.remove('hidden');
}

// Hàm hiển thị dự báo thời tiết
function displayForecast(data) {
    forecastContainer.innerHTML = '';
    
    // Nhóm dữ liệu theo ngày (API trả về dữ liệu 3h/lần)
    const dailyForecasts = {};
    data.list.forEach(item => {
        const date = new Date(item.dt * 1000).toLocaleDateString();
        if (!dailyForecasts[date]) {
            dailyForecasts[date] = item;
        }
    });
    
    // Hiển thị dự báo cho 5 ngày tiếp theo
    const today = new Date().toLocaleDateString();
    let count = 0;
    
    for (const date in dailyForecasts) {
        if (date !== today && count < 5) {
            const forecast = dailyForecasts[date];
            const forecastDay = document.createElement('div');
            forecastDay.className = 'forecast-day';
            
            const dayName = new Date(forecast.dt * 1000).toLocaleDateString('vi-VN', { weekday: 'long' });
            
            forecastDay.innerHTML = `
                <h4>${dayName}</h4>
                <img src="https://openweathermap.org/img/wn/${forecast.weather[0].icon}.png" alt="${forecast.weather[0].description}">
                <p class="forecast-temp">${Math.round(forecast.main.temp)}°C</p>
                <p>${forecast.weather[0].description}</p>
            `;
            
            forecastContainer.appendChild(forecastDay);
            count++;
        }
    }
    
    forecastEl.classList.remove('hidden');
}

// Hàm hiển thị trạng thái loading
function showLoading() {
    loadingEl.classList.remove('hidden');
    currentWeatherEl.classList.add('hidden');
    forecastEl.classList.add('hidden');
    hideError();
}

// Hàm ẩn trạng thái loading
function hideLoading() {
    loadingEl.classList.add('hidden');
}

// Hàm hiển thị lỗi
function showError(message) {
    hideLoading();
    errorEl.textContent = message;
    errorEl.classList.remove('hidden');
}

// Hàm ẩn thông báo lỗi
function hideError() {
    errorEl.classList.add('hidden');
}

// Kiểm tra kết nối mạng
window.addEventListener('online', () => {
    console.log('Ứng dụng đang online');
});

window.addEventListener('offline', () => {
    showError('Mất kết nối mạng. Đang hiển thị dữ liệu đã lưu.');
});

// Khởi tạo ứng dụng: tải dữ liệu mặc định (nếu có)
document.addEventListener('DOMContentLoaded', () => {
    // Thử tải dữ liệu đã lưu cho Hà Nội
    const cachedData = Storage.getWeatherData('Hanoi');
    if (cachedData && !Storage.isDataExpired(cachedData.timestamp)) {
        displayWeatherData(cachedData.data);
    }
});