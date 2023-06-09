const express = require('express')
const mysql = require('mysql');
const path = require('path');
const app = express(); 
const session = require('express-session');


// Соединение с базой данных
const connection = mysql.createConnection({
    host: process.env.HOST,
    database: process.env.DATABASE,
    user: process.env.DBUSER,
    password: process.env.PASSWORD
});

connection.connect((err) => {
    if (err) {
        console.log(err);
    }
});
// Путь к директории файлов ресурсов (css, js, images)
app.use(express.static('public'));
app.use(session({ secret: "Secret", resave: false, saveUninitialized: true }));
// Настройка шаблонизатора
app.set('view engine', 'ejs');

// Путь к директории файлов отображения контента
app.set('views', path.join(__dirname, 'views'));

// Обработка POST-запросов из форм
app.use(express.urlencoded({ extended: true }));

// Запуск веб-сервера по адресу http://localhost:3000
app.listen(3000);


function isAuth(req, res, next) {
    if (req.session.auth) {
        next();
    } else {
        res.redirect('/');
    }
}
/**
 * Маршруты
 */
app.get('/', (req, res) => {
    const itemsPerPage = 4;
    let page = parseInt(req.query.page);
    if (!page) page = 1;
    connection.query("Select count(id) as count from items", (err, data, fields) => {
        const itemsCount = (data[0].count);
        const pagesCount = Math.ceil(itemsCount / itemsPerPage);
        if(page > pagesCount) {
            res.redirect('/?page=' + (pagesCount))
        }
        connection.query("SELECT * FROM items limit ? offset ?", [[itemsPerPage], [(page - 1) * itemsPerPage ]], (err, data, fields) => {
            if (err) {
             
                console.log(err);
            }
            res.render('home', {
                'items': data,
                'pages': pagesCount,
                'page': parseInt(page)    
            });
        });
    });
})

app.get('/items/:id', (req, res) => {
    connection.query("SELECT * FROM items WHERE id=?", [req.params.id],
        (err, data, fields) => {
            if (err) {
                console.log(err);
            }

            res.render('item', {
                'item': data[0],
            })
        });
})

app.get('/add', isAuth, (req, res) => {
    res.render('add')
})

app.post('/store', (req, res) => {
    connection.query(
        "INSERT INTO items (title, image) VALUES (?, ?)",
        [[req.body.title], [req.body.image]],
        (err, data, fields) => {
            if (err) {
                console.log(err);
            }

            res.redirect('/');
        }
    );
})

app.post('/delete', (req, res) => {
    connection.query(
        "DELETE FROM items WHERE id=?", [[req.body.id]], (err, data, fields) => {
            if (err) {
                console.log(err);
            }
            res.redirect('/');
        }
    );
})

app.post('/update', (req, res) => {
    connection.query(
        "UPDATE items SET title=?, image=? WHERE id=?", [[req.body.title],[req.body.image],[req.body.id]], (err, data, fields) => {
            if (err) {
                console.log(err);
            }
            res.redirect('/');
        }
    );
})

app.get('/auth', (req,res) => {
    res.render('auth');

});

app.post('/authh', (req, res) => {
    connection.query(
        "SELECT * FROM users WHERE name=? and password=?",
        [[req.body.name], [req.body.password]],
        (err, data, fields) => {
            if (err) {
                console.log(err);
            }
            if (data.length > 0) {
                console.log('auth');       
            } else {
                console.log('no auth');
            }
            req.session.auth = true;
            res.redirect('/');
        } 
    );
})