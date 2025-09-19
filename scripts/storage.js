const Storage = {
    // Lưu dữ liệu thời tiết
    saveWeatherData: function(city, data) {
        const storageData = {
            data: data,
            timestamp: new Date().getTime()
        };
        localStorage.setItem(`weather_${city}`, JSON.stringify(storageData));
    },
    
    // Lấy dữ liệu thời tiết
    getWeatherData: function(city) {
        const item = localStorage.getItem(`weather_${city}`);
        return item ? JSON.parse(item) : null;
    },
    
    // Kiểm tra dữ liệu có hết hạn không (10 phút)
    isDataExpired: function(timestamp) {
        const now = new Date().getTime();
        const tenMinutes = 10 * 60 * 1000; // 10 phút
        return now - timestamp > tenMinutes;
    },
    
    // Xóa dữ liệu cũ
    clearExpiredData: function() {
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith('weather_')) {
                const item = localStorage.getItem(key);
                const data = JSON.parse(item);
                
                if (this.isDataExpired(data.timestamp)) {
                    localStorage.removeItem(key);
                }
            }
        }
    }
};

// Dọn dẹp dữ liệu hết hạn khi tải trang
window.addEventListener('load', () => {
    Storage.clearExpiredData();
});