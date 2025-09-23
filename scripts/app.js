// const apiKey = 'e760d40b60fc82b10ac9aceb9a34c10a'; // Thay bằng API key của bạn
// API Configuration
const API_KEY = 'e760d40b60fc82b10ac9aceb9a34c10a'; // Thay thế bằng API key thực của bạn
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
const alertSection = document.getElementById('alerts');
const alertContainer = document.getElementById('alert-container');
const mapSection = document.getElementById('map-section');
const languageSelector = document.getElementById('language-selector');
const celsiusBtn = document.getElementById('celsius-btn');
const fahrenheitBtn = document.getElementById('fahrenheit-btn');

// Biến toàn cục
let currentUnit = 'celsius';
let map = null;
let currentData = null;

// Bản dịch cho các ngôn ngữ khác nhau
const translations = {
    vi: {
        searchPlaceholder: "Nhập tên thành phố...",
        searchButton: "Tìm kiếm",
        locationButton: "Vị trí hiện tại",
        loadingText: "Đang tải dữ liệu...",
        currentWeather: "Thời tiết hiện tại",
        forecast: "Dự báo 5 ngày",
        alerts: "Cảnh báo thời tiết",
        map: "Bản đồ thời tiết",
        humidity: "Độ ẩm",
        wind: "Gió",
        pressure: "Áp suất",
        visibility: "Tầm nhìn",
        uv: "Chỉ số UV",
        rain: "Lượng mưa",
        providedBy: "Dữ liệu được cung cấp bởi",
        weatherAlerts: "Cảnh báo thời tiết",
        noAlerts: "Không có cảnh báo thời tiết nào tại thời điểm này.",
        alertFrom: "Cảnh báo từ",
        until: "đến",
        error: "Lỗi",
        cityNotFound: "Không tìm thấy thành phố",
        locationError: "Không thể lấy vị trí"
    },
    en: {
        searchPlaceholder: "Enter city name...",
        searchButton: "Search",
        locationButton: "Current Location",
        loadingText: "Loading data...",
        currentWeather: "Current Weather",
        forecast: "5-Day Forecast",
        alerts: "Weather Alerts",
        map: "Weather Map",
        humidity: "Humidity",
        wind: "Wind",
        pressure: "Pressure",
        visibility: "Visibility",
        uv: "UV Index",
        rain: "Rain",
        providedBy: "Data provided by",
        weatherAlerts: "Weather Alerts",
        noAlerts: "No weather alerts at this time.",
        alertFrom: "Alert from",
        until: "until",
        error: "Error",
        cityNotFound: "City not found",
        locationError: "Unable to get location"
    },
    fr: {
        searchPlaceholder: "Entrez le nombre de la ville...",
        searchButton: "Rechercher",
        locationButton: "Localisation actuelle",
        loadingText: "Chargement des données...",
        currentWeather: "Météo actuelle",
        forecast: "Prévisions sur 5 jours",
        alerts: "Alertes météo",
        map: "Carte météo",
        humidity: "Humidité",
        wind: "Vent",
        pressure: "Pression",
        visibility: "Visibilité",
        uv: "Indice UV",
        rain: "Pluie",
        providedBy: "Données fournies par",
        weatherAlerts: "Alertes météo",
        noAlerts: "Aucune alerte météo pour le moment.",
        alertFrom: "Alerte de",
        until: "jusqu'à",
        error: "Erreur",
        cityNotFound: "Ville non trouvée",
        locationError: "Impossible d'obtenir la localisation"
    },
    es: {
        searchPlaceholder: "Ingrese el nombre de la ciudad...",
        searchButton: "Buscar",
        locationButton: "Ubicación actual",
        loadingText: "Cargando datos...",
        currentWeather: "Clima actual",
        forecast: "Pronóstico de 5 días",
        alerts: "Alertas climáticas",
        map: "Mapa del clima",
        humidity: "Humedad",
        wind: "Viento",
        pressure: "Presión",
        visibility: "Visibilidad",
        uv: "Índice UV",
        rain: "Lluvia",
        providedBy: "Datos proporcionados por",
        weatherAlerts: "Alertas climáticas",
        noAlerts: "No hay alertas climáticas en este momento.",
        alertFrom: "Alerta desde",
        until: "hasta",
        error: "Error",
        cityNotFound: "Ciudad no encontrada",
        locationError: "No se puede obtener la ubicación"
    }
};

// Thiết lập ngôn ngữ mặc định
let currentLanguage = 'vi';

// Event Listeners
searchBtn.addEventListener('click', handleSearch);
locationBtn.addEventListener('click', getLocationWeather);
searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleSearch();
});

languageSelector.addEventListener('change', changeLanguage);
celsiusBtn.addEventListener('click', () => changeUnit('celsius'));
fahrenheitBtn.addEventListener('click', () => changeUnit('fahrenheit'));

// Hàm thay đổi ngôn ngữ
function changeLanguage() {
    currentLanguage = languageSelector.value;
    updateUIWithTranslations();

    // Cập nhật lại dữ liệu thời tiết nếu đã có
    if (currentData) {
        displayWeatherData(currentData);
    }
}

// Hàm cập nhật giao diện với bản dịch
function updateUIWithTranslations() {
    const t = translations[currentLanguage];

    // Cập nhật các phần tử giao diện
    searchInput.placeholder = t.searchPlaceholder;
    searchBtn.innerHTML = `<i class="fas fa-search"></i> ${t.searchButton}`;
    locationBtn.innerHTML = `<i class="fas fa-location-arrow"></i> ${t.locationButton}`;
    loadingEl.innerHTML = `<i class="fas fa-spinner fa-spin"></i> ${t.loadingText}`;
    document.querySelector('#current-weather h2').innerHTML = `<i class="fas fa-cloud-sun-rain"></i> ${t.currentWeather}`;
    document.querySelector('#forecast h2').innerHTML = `<i class="fas fa-calendar-alt"></i> ${t.forecast}`;
    document.querySelector('#alerts h2').innerHTML = `<i class="fas fa-exclamation-triangle"></i> ${t.alerts}`;
    document.querySelector('#map-section h2').innerHTML = `<i class="fas fa-map-marked-alt"></i> ${t.map}`;

    // Cập nhật footer
    document.querySelector('footer p').innerHTML = `${t.providedBy} <a href="https://openweathermap.org/"><i class="fas fa-external-link-alt"></i> OpenWeatherMap</a>`;

    // Cập nhật các thẻ chi tiết
    document.querySelector('[data-translate="humidity"]').innerHTML = `<i class="fas fa-tint"></i> ${t.humidity}`;
    document.querySelector('[data-translate="wind"]').innerHTML = `<i class="fas fa-wind"></i> ${t.wind}`;
    document.querySelector('[data-translate="pressure"]').innerHTML = `<i class="fas fa-compress-alt"></i> ${t.pressure}`;
    document.querySelector('[data-translate="visibility"]').innerHTML = `<i class="fas fa-eye"></i> ${t.visibility}`;
    document.querySelector('[data-translate="uv"]').innerHTML = `<i class="fas fa-sun"></i> ${t.uv}`;
    document.querySelector('[data-translate="rain"]').innerHTML = `<i class="fas fa-cloud-rain"></i> ${t.rain}`;
}

// Hàm thay đổi đơn vị nhiệt độ
function changeUnit(unit) {
    currentUnit = unit;

    // Cập nhật nút active
    celsiusBtn.classList.toggle('active', unit === 'celsius');
    fahrenheitBtn.classList.toggle('active', unit === 'fahrenheit');

    // Cập nhật lại dữ liệu thời tiết nếu đã có
    if (currentData) {
        displayWeatherData(currentData);
    }
}

// Hàm chuyển đổi nhiệt độ
function convertTemperature(temp) {
    if (currentUnit === 'celsius') {
        return temp;
    } else {
        // Chuyển từ Celsius sang Fahrenheit
        return (temp * 9 / 5) + 32;
    }
}

// Hàm xử lý tìm kiếm
function handleSearch() {
    const city = searchInput.value.trim();
    if (city) {
        getWeatherData(city);
    } else {
        showError(translations[currentLanguage].cityNotFound);
    }
}

// Hàm lấy thời tiết theo vị trí
function getLocationWeather() {
    if (!navigator.geolocation) {
        showError(translations[currentLanguage].locationError);
        return;
    }

    showLoading();
    navigator.geolocation.getCurrentPosition(
        position => {
            const { latitude, longitude } = position.coords;
            getWeatherByCoords(latitude, longitude);
        },
        error => {
            showError(`${translations[currentLanguage].locationError}: ${error.message}`);
            hideLoading();
        }
    );
}

// Hàm lấy dữ liệu thời tiết theo tên thành phố
// Hàm bỏ dấu tiếng Việt
function removeVietnameseTones(str) {
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D');
}

async function getWeatherData(cityInput) {
    showLoading();
    hideError();

    // Chuẩn hóa input
    let city = cityInput.trim();
    let country = 'VN'; // Bạn có thể cho người dùng chọn country nếu muốn

    // Bỏ dấu để so sánh
    const cityNoAccent = removeVietnameseTones(city).toLowerCase();

    // Lấy nhiều kết quả để lọc
    const geoRes = await fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(city)},${country}&limit=10&appid=${API_KEY}`);
    const geoData = await geoRes.json();

    if (!geoData || geoData.length === 0) {
        showError(translations[currentLanguage].cityNotFound);
        return;
    }

    // Lọc kết quả: country VN, type city, name trùng khớp (không dấu)
    let location = geoData.find(loc =>
        loc.country === 'VN' &&
        (loc.type === 'city' || loc.type === 'administrative') &&
        removeVietnameseTones(loc.name).toLowerCase() === cityNoAccent
    );

    // Nếu không có, ưu tiên type city
    if (!location) {
        location = geoData.find(loc =>
            loc.country === 'VN' &&
            (loc.type === 'city' || loc.type === 'administrative')
        );
    }

    // Nếu vẫn không có, ưu tiên name trùng khớp (không dấu)
    if (!location) {
        location = geoData.find(loc =>
            loc.country === 'VN' &&
            removeVietnameseTones(loc.name).toLowerCase() === cityNoAccent
        );
    }

    // Nếu vẫn không có, lấy kết quả đầu tiên có country VN
    if (!location) {
        location = geoData.find(loc => loc.country === 'VN');
    }

    // Nếu vẫn không có, lấy kết quả đầu tiên
    if (!location) {
        location = geoData[0];
    }

    const { lat, lon, name, country: countryCode } = location;

    // Lấy thời tiết hiện tại
    const weatherRes = await fetch(`${BASE_URL}/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=${currentLanguage}`);
    const weatherData = await weatherRes.json();

    // Lấy dự báo 5 ngày
    const forecastRes = await fetch(`${BASE_URL}/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=${currentLanguage}`);
    const forecastData = await forecastRes.json();

    // Gộp dữ liệu
    const data = {
        current: weatherData,
        forecast: forecastData,
        alerts: []
    };

    displayWeatherData(data);
}
// Hàm lấy dữ liệu thời tiết theo tọa độ
async function getWeatherByCoords(lat, lon) {
    try {
        // Sử dụng dữ liệu mẫu cho mục đích demo
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Tạo dữ liệu giả lập cho demo
        const demoData = {
            current: {
                name: "Vị trí của bạn",
                coord: {
                    lat: lat,
                    lon: lon
                },
                sys: { country: "" },
                main: {
                    temp: Math.round(Math.random() * 30 + 10),
                    humidity: Math.round(Math.random() * 50 + 30),
                    pressure: Math.round(Math.random() * 200 + 1000),
                    feels_like: Math.round(Math.random() * 30 + 10)
                },
                wind: {
                    speed: (Math.random() * 10).toFixed(1),
                    deg: Math.round(Math.random() * 360)
                },
                weather: [{
                    description: ["nắng", "mây", "mưa nhẹ", "trời quang"][Math.floor(Math.random() * 4)],
                    icon: ["01d", "02d", "03d", "04d", "09d", "10d", "11d", "13d", "50d"][Math.floor(Math.random() * 9)]
                }],
                visibility: Math.round(Math.random() * 10 + 5) * 1000, // meters
                rain: Math.random() > 0.7 ? { "1h": (Math.random() * 10).toFixed(1) } : null
            },
            forecast: {
                list: Array(5).fill().map((_, i) => {
                    const date = new Date();
                    date.setDate(date.getDate() + i + 1);
                    return {
                        dt: Math.floor(date.getTime() / 1000),
                        main: {
                            temp: Math.round(Math.random() * 30 + 10),
                            humidity: Math.round(Math.random() * 50 + 30),
                        },
                        weather: [{
                            description: ["nắng", "mây", "mưa nhẹ", "trời quang"][Math.floor(Math.random() * 4)],
                            icon: ["01d", "02d", "03d", "04d", "09d", "10d", "11d", "13d", "50d"][Math.floor(Math.random() * 9)]
                        }],
                        wind: {
                            speed: (Math.random() * 10).toFixed(1)
                        }
                    };
                })
            },
            alerts: Math.random() > 0.7 ? [
                {
                    event: "Cảnh báo mưa lớn",
                    description: "Mưa lớn dự kiến với lượng mưa có thể lên tới 100mm",
                    start: Date.now() / 1000,
                    end: Date.now() / 1000 + 86400,
                    sender_name: "Trung tâm Dự báo Khí tượng Thủy văn"
                }
            ] : []
        };

        // Thêm chỉ số UV ngẫu nhiên
        demoData.current.uvi = (Math.random() * 12).toFixed(1);

        displayWeatherData(demoData);
        searchInput.value = "Vị trí hiện tại";
    } catch (error) {
        showError(error.message);
    }
}

// Hàm hiển thị dữ liệu thời tiết
function displayWeatherData(data) {
    currentData = data;
    hideLoading();
    displayAlerts(data.alerts);
    displayCurrentWeather(data.current);
    displayMap(data.current.coord);
    displayForecast(data.forecast);
}

// Hàm hiển thị cảnh báo thời tiết
function displayAlerts(alerts) {
    alertContainer.innerHTML = '';

    if (alerts && alerts.length > 0) {
        alertSection.classList.remove('hidden');

        alerts.forEach(alert => {
            const alertElement = document.createElement('div');
            alertElement.className = 'alert-card';

            const startDate = new Date(alert.start * 1000).toLocaleDateString(currentLanguage);
            const endDate = new Date(alert.end * 1000).toLocaleDateString(currentLanguage);

            alertElement.innerHTML = `
                <h3><i class="fas fa-exclamation-circle"></i> ${alert.event}</h3>
                <p>${alert.description}</p>
                <p><strong>${translations[currentLanguage].alertFrom}:</strong> ${startDate} <strong>${translations[currentLanguage].until}:</strong> ${endDate}</p>
                <p><strong>Nguồn:</strong> ${alert.sender_name}</p>
            `;

            alertContainer.appendChild(alertElement);
        });
    } else {
        alertSection.classList.add('hidden');
    }
}

// Hàm hiển thị thời tiết hiện tại
function displayCurrentWeather(data) {
    const t = translations[currentLanguage];

    // Kiểm tra tồn tại name và country
    const cityName = data.name || '';
    const country = (data.sys && data.sys.country) ? data.sys.country : '';
    document.getElementById('city-name').textContent = `${cityName}${country ? ', ' + country : ''}`;

    // Nhiệt độ
    const temp = data.main && typeof data.main.temp !== 'undefined' ? convertTemperature(data.main.temp) : 'N/A';
    document.getElementById('current-temp').textContent = `${temp !== 'N/A' ? Math.round(temp) : temp}°${currentUnit === 'celsius' ? 'C' : 'F'}`;

    // Mô tả thời tiết
    const weatherDesc = (data.weather && data.weather[0] && data.weather[0].description) ? data.weather[0].description : '';
    document.getElementById('weather-desc').textContent = weatherDesc;

    // Độ ẩm
    document.getElementById('humidity').textContent = data.main && typeof data.main.humidity !== 'undefined' ? data.main.humidity : 'N/A';

    // Gió
    document.getElementById('wind-speed').textContent = data.wind && typeof data.wind.speed !== 'undefined' ? data.wind.speed : 'N/A';

    // Áp suất
    document.getElementById('pressure').textContent = data.main && typeof data.main.pressure !== 'undefined' ? data.main.pressure : 'N/A';

    // Tầm nhìn (mét sang km)
    document.getElementById('visibility').textContent = typeof data.visibility !== 'undefined' ? (data.visibility / 1000).toFixed(1) : 'N/A';

    // Chỉ số UV (chỉ có nếu lấy từ One Call API)
    document.getElementById('uv-index').textContent = typeof data.uvi !== 'undefined' ? data.uvi : 'N/A';

    // Lượng mưa
    let rainVolume = '0';
    if (data.rain && typeof data.rain["1h"] !== 'undefined') {
        rainVolume = data.rain["1h"];
    }
    document.getElementById('rain-volume').textContent = rainVolume;

    // Icon thời tiết
    const iconCode = (data.weather && data.weather[0] && data.weather[0].icon) ? data.weather[0].icon : '01d';
    document.getElementById('weather-icon').src = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
    document.getElementById('weather-icon').alt = weatherDesc;

    currentWeatherEl.classList.remove('hidden');
}

// Hàm hiển thị bản đồ
function displayMap(coords) {
    // Xóa bản đồ cũ nếu tồn tại
    if (map) {
        map.remove();
    }

    // Hiển thị section bản đồ
    mapSection.classList.remove('hidden');

    // Tạo bản đồ mới
    map = L.map('map').setView([coords.lat, coords.lon], 10);

    // Thêm layer bản đồ
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // Thêm marker cho vị trí
    L.marker([coords.lat, coords.lon])
        .addTo(map)
        .bindPopup('Vị trí hiện tại')
        .openPopup();

    // Thêm layer mây (chỉ là ví dụ, không có dữ liệu thực)
    L.tileLayer('https://tile.openweathermap.org/map/clouds_new/{z}/{x}/{y}.png?appid={apiKey}', {
        apiKey: API_KEY,
        opacity: 0.4
    }).addTo(map);
}

// Hàm hiển thị dự báo thời tiết
function displayForecast(data) {
    forecastContainer.innerHTML = '';

    // Hiển thị dự báo cho 5 ngày tiếp theo
    for (let i = 0; i < 5; i++) {
        const forecast = data.list[i];
        const forecastDay = document.createElement('div');
        forecastDay.className = 'forecast-day';

        const date = new Date(forecast.dt * 1000);
        const dayName = date.toLocaleDateString(currentLanguage, { weekday: 'long' });

        const temp = convertTemperature(forecast.main.temp);

        forecastDay.innerHTML = `
            <h4>${dayName}</h4>
            <img src="https://openweathermap.org/img/wn/${forecast.weather[0].icon}.png" alt="${forecast.weather[0].description}">
            <p class="forecast-temp">${Math.round(temp)}°${currentUnit === 'celsius' ? 'C' : 'F'}</p>
            <p>${forecast.weather[0].description}</p>
            <p><i class="fas fa-tint"></i> ${forecast.main.humidity}%</p>
            <p><i class="fas fa-wind"></i> ${forecast.wind.speed} m/s</p>
        `;

        forecastContainer.appendChild(forecastDay);
    }

    forecastEl.classList.remove('hidden');
}

// Hàm hiển thị trạng thái loading
function showLoading() {
    loadingEl.classList.remove('hidden');
    currentWeatherEl.classList.add('hidden');
    forecastEl.classList.add('hidden');
    alertSection.classList.add('hidden');
    mapSection.classList.add('hidden');
    hideError();
}

// Hàm ẩn trạng thái loading
function hideLoading() {
    loadingEl.classList.add('hidden');
}

// Hàm hiển thị lỗi
function showError(message) {
    hideLoading();
    errorEl.textContent = `${translations[currentLanguage].error}: ${message}`;
    errorEl.classList.remove('hidden');
}

// Hàm ẩn thông báo lỗi
function hideError() {
    errorEl.classList.add('hidden');
}

// Khởi tạo ứng dụng
document.addEventListener('DOMContentLoaded', () => {
    // Hiển thị hướng dẫn sử dụng
    searchInput.placeholder = translations[currentLanguage].searchPlaceholder;

    // Thêm data-translate attribute cho các phần tử cần dịch
    document.querySelectorAll('.detail-card h4').forEach((el, index) => {
        const keys = ['humidity', 'wind', 'pressure', 'visibility', 'uv', 'rain'];
        if (index < keys.length) {
            el.setAttribute('data-translate', keys[index]);
        }
    });

    // Cập nhật giao diện với ngôn ngữ mặc định
    updateUIWithTranslations();
});