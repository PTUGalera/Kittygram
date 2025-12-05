/**
 * Конвертирует файл изображения в Base64 строку
 * @param {File} file - Файл изображения
 * @returns {Promise<string>} Promise с Base64 строкой в формате data:image/...;base64,...
 */
export const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
        if (!file) {
            resolve(null);
            return;
        }

        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = (error) => reject(error);
    });
};

/**
 * Валидирует файл изображения
 * @param {File} file - Файл для валидации
 * @returns {string|null} Сообщение об ошибке или null если всё ок
 */
export const validateImageFile = (file) => {
    if (!file) {
        return null;
    }

    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];
    if (!validTypes.includes(file.type)) {
        return "Поддерживаются только изображения (JPEG, PNG, GIF, WebP)";
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
        return "Размер файла не должен превышать 5MB";
    }

    return null;
};

