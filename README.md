Я у мами так-собі ресьорчер))

1. Запитав у декількох вебдев-комьюніті, де б вони робили адмін-панель. Так я познайомився зі Strapi) Наче те, що треба, доки зрозумілі, ще й красиві. Ресьорчь зайняв ~4 хвилини))
2. Про файли ресьорчить не можу, не знаючи, що саме потрібно з файлами робити. Зберігати локально й розкладати по папах - нічого не треба, максимум fs-extra, як невеличке доповнення до вбудованого fs. На хмарку - то треба знати, що складаємо й якого воно може бути розміру. Будь-яка обробка специфічна для різних типів файлів.

Я у мами ще й розробник)

Лежить тут:
https://github.com/Maks-Budiukin/test-task-userprofile-backend

1. Стек: NestJS, Mongoose, MongoDB.

2. Ендпоінти:

@POST /api/user/register - створення користувача  
@GET /api/user/activate/:token - верифікація емейла  
@POST /api/user/login - логін  
@GET /api/user/curret - рефреш користувача (щоб не вилітав при обновленні сторінки, за умови, що токен на фронті персистять  
@PATCH /api/user/upadte/:id - редагування профілю  
@GET /api/user/logout - до побачення

3. Ключові ліби:

Passport + jwt - аутентифікація  
nodemailer - спам на пошту  
class-validator - валідація  
sharp - обробка зображень

4. Зазвичай виношу редагування юзера в окремий модуль, щоб "не смітити" в аутентифікації, але в данному випадку це, як на мене, не має сенсу. До того ж, в рамках тестового працюємо лише з одною моделькою, то ж вирішив об'єднання в один модуль практичним.

5. .env навмисно винесений з гітігнору, щоб не передавати на перевірку змінні середовища якось окремо.

6. Токен не протухає теж навмисно.

Зайняло 2 дні по 6 годин мінус перерва на обід.
