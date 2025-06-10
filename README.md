# NotaSpace - Web-сервис ведения заметок на базе свободно-распространяемого API

![icon](./public/favicon.ico)

**NotaSpace** – это удобное веб-приложение для создания и управления заметками с React-интерфейсом с привязкой свободно-распространяемого API ([_NoteVault_](https://github.com/LoL-KeKovich/NoteVault)).

## 🚀 Особенности  
- 📝 **Создание, управление и редактирование заметок**
- 🗑️ Наличие функционала удобного **архива и корзины**
- 🏷️ **Книги и теги** для организации заметок  
- 🔍 **Поиск** по названию и содержимому
- 📌 **Фильтрация по приоритету**
- 🎨 **Присвоение цвета заметкам**
- 📄 **Поддержка Markdown-формата**
- 📱 **Полностью адаптивный интерфейс**  

## ⚙️ Технологии  
- **Frontend:** React, Typescript
- **API:** Golang, MongoDB
- **Дополнительно:** Docker, Docker Compose  

---

## 🛠 Быстрый старт  

### Требования:
- MongoDB (локально как минимум)
- Docker (не обязательно)

1. **Клонируйте репозитории:**  
   ```bash
   git clone https://github.com/proxod3-first/NotaSpace.git
   git clone https://github.com/LoL-KeKovich/NoteVault.git
   mkdir ProjectFolder
   mv NotaSpace/ ProjectFolder/
   mv NotaVault/ ProjectFolder/
   ```

2. **Создайте docker-compose.yml в ProjectFolder:**
  ```yaml
  version: '3.1'
  
  services:
    mongo:
      image: mongo
      restart: always
      environment:
        MONGO_INITDB_ROOT_USERNAME: root
        MONGO_INITDB_ROOT_PASSWORD: example
      ports:
        - 27017:27017
  
    note-api:
      build:
        context: "./NoteVault"
        dockerfile: Dockerfile
      ports:
        - 8085:8085
      depends_on:
        - mongo
      environment:
        CONFIG_PATH: "/app/config/local.yaml"
  
    frontend-app:
      build:
        context: "./NotaSpace"
        dockerfile: Dockerfile
      ports:
        - 3000:3000
  ```

### Вариант 1: Запуск вручную (разработка)  

1. **Установите зависимости:**  
   ```bash
   cd NotaSpace && npm install
   ```

2. **Настройте переменные окружения:**  
   - Создайте `.env` на основе `.env.example`  
   - Пример:
     ```env
     REACT_APP_BASE_URL=http://localhost:8085/api/v1
     ```
     
3. **Запустите MongoDB через mongod**
   
4. **Запустите API:**  
   ```bash
   # В консоли (API)
   cd NotaVault
   $env:CONFIG_PATH = "./config/local.yaml"
   go run cmd/NoteVault/main.go
   ```
   
5. **Запустите клиента:**  
   ```bash
   # В консоли (клиент)
   npm start
   ```

6. **Web-сервис будет доступен:**

🔹 **Frontend:** [http://localhost:3000](http://localhost:3000)  
🔹 **API:** [http://localhost:8085/api/v1](http://localhost:8085/api/v1)  

---

### Вариант 2: Запуск через Docker  

1. **Соберите и запустите контейнеры в ProjectFolder:**
   ```bash
   docker-compose up --build
   ```

2. **Web-сервис будет доступен:**  
   - **Frontend:** [http://localhost:3000](http://localhost:3000)  
   - **API:** [http://localhost:8085/api/v1](http://localhost:8085/api/v1)  

---

## 📄 Лицензия  
GPL-3.0 License.

---

## 🤝 Контрибьюция  

1. Форкните репозиторий  
2. Создайте ветку (`git checkout -b feature/your-feature`)  
3. Зафиксируйте изменения (`git commit -m 'Add some feature'`)  
4. Запушьте в форк (`git push origin feature/your-feature`)  
5. Откройте Pull Request  

---

## 📬 Контакты  
- Автор клиентской части: [proxod3-first](https://github.com/proxod3-first)
- Автор API: [LoL-KeKovich](https://github.com/LoL-KeKovich)   

--- 

✨ **Пространство для заметок!** ✨
