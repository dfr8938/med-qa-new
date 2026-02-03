const request = require('supertest');
const { User } = require('../models');

// Создаем экземпляр приложения для тестирования
const app = require('../index')();

describe('Тесты аутентификации', () => {
  // Переменные для тестов
  let testUser = {
    username: 'testuser',
    email: 'testuser@example.com',
    password: 'testpassword123'
  };

  // Создание тестового пользователя перед запуском тестов
  beforeAll(async () => {
    // Удаление тестового пользователя, если он существует
    await User.destroy({ where: { email: testUser.email } });
    
    // Создание нового тестового пользователя
    await User.create(testUser);
  });

  // Удаление тестового пользователя после завершения тестов
  afterAll(async () => {
    await User.destroy({ where: { email: testUser.email } });
  });

  // Тест для регистрации нового пользователя
  describe('POST /api/auth/register', () => {
    it('должен успешно зарегистрировать нового пользователя', async () => {
      const newUser = {
        username: 'newuser',
        email: 'newuser@example.com',
        password: 'newpassword123'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(newUser)
        .expect(201);

      // Проверка структуры ответа
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('id');
      expect(response.body.user).toHaveProperty('username', newUser.username);
      expect(response.body.user).toHaveProperty('email', newUser.email);
      expect(response.body.user).toHaveProperty('role');
      
      // Удаление тестового пользователя после теста
      await User.destroy({ where: { email: newUser.email } });
    });

    it('должен вернуть ошибку при попытке регистрации с уже существующим email', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send(testUser)
        .expect(400);

      expect(response.body).toHaveProperty('message', 'Пользователь с таким email уже существует');
    });

    it('должен вернуть ошибку при отсутствии обязательных полей', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({ username: 'test' })
        .expect(400);

      expect(response.body).toHaveProperty('message', 'Все поля обязательны для заполнения');
    });
  });

  // Тест для входа пользователя в систему
  describe('POST /api/auth/login', () => {
    it('должен успешно авторизовать пользователя с правильными учетными данными', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password
        })
        .expect(200);

      // Проверка структуры ответа
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('id');
      expect(response.body.user).toHaveProperty('username', testUser.username);
      expect(response.body.user).toHaveProperty('email', testUser.email);
      expect(response.body.user).toHaveProperty('role');
    });

    it('должен вернуть ошибку при неправильном email', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'wrong@example.com',
          password: testUser.password
        })
        .expect(400);

      expect(response.body).toHaveProperty('message', 'Неверный email или пароль');
    });

    it('должен вернуть ошибку при неправильном пароле', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: 'wrongpassword'
        })
        .expect(400);

      expect(response.body).toHaveProperty('message', 'Неверный email или пароль');
    });

    it('должен вернуть ошибку при отсутствии обязательных полей', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: testUser.email })
        .expect(400);

      expect(response.body).toHaveProperty('message', 'Email и пароль обязательны для заполнения');
    });
  });

  // Тест для получения информации о текущем пользователе
  describe('GET /api/auth/me', () => {
    let token;

    // Получение токена перед тестами
    beforeAll(async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password
        });
      
      token = response.body.token;
    });

    it('должен вернуть информацию о текущем пользователе при наличии токена', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('username', testUser.username);
      expect(response.body).toHaveProperty('email', testUser.email);
      expect(response.body).toHaveProperty('role');
    });

    it('должен вернуть ошибку при отсутствии токена', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .expect(401);

      expect(response.body).toHaveProperty('message');
    });
  });
});