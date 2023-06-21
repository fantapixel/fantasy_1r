const express = require('express')
const mysql = require('mysql');
const path = require('path');
const app = express(); 
const session = require('express-session');
const { count } = require('console');

require('dotenv').config();
app.use(express.json());
// Соединение с базой данных
const connection = mysql.createConnection({
    host: process.env.HOST,
    database: process.env.DATABASE,
    user: process.env.DB_USER,
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
    connection.query("Select count(id) as count from items", (err, data, fields) => {
        const itemsCount = (data[0].count);
        const pagesCount = Math.ceil(itemsCount / itemsPerPage);
        connection.query("SELECT * FROM items limit ? offset 0", [[itemsPerPage]], (err, data, fields) => {
            if (err) {
             
                console.log(err);
            }
            connection.query("SELECT * FROM category",
            (err, thisa, fields) => {
                if (err) {
                    console.log(err);
                }
                connection.query("Select * from category", (err, count, fields) => {
                res.render('home', {
                    'items': data,
                    'pages': pagesCount,  
                    'thisa': thisa,
                    'all': true,
                    'dot': count,
                });
            });
        });
    });
});
})
app.post('/items', (req, res) => {
    let offset = (req.body.offset);
    connection.query("SELECT * FROM items limit 4 offset ?", [[offset]], (err, data, fields) => {
        if (err) {
            console.log(err);
        }
        connection.query("Select * from category limit 4 offset ?", [[offset]], (err, cats, fields) => {
            if (err) console.log(err);
            res.status(200).send(data);
        })
    });
});

app.get('/home/:id', (req, res) => {
    if(req.params.id == 'all') {
        res.redirect('/');
    }
    const itemsPerPage = 4;
    connection.query("Select count(id) as count from items", (err, data, fields) => {
        const itemsCount = (data[0].count);
        const pagesCount = Math.ceil(itemsCount / itemsPerPage);
    connection.query("Select * from items where catID=? limit ? offset 0", [[req.params.id], [itemsPerPage]], (err, data, fields) => {
        if (err) console.log(err);
        console.log(data);
    connection.query("Select * from category", (err, count, fields) => {
        res.render('home', {
            'items': data,
            'pages': pagesCount,
            'all': false,
            'dot': count
        });
    });
});
});
});

app.get('/items/:id', (req, res) => {
    connection.query("SELECT * FROM items WHERE id=?", [[req.params.id]],
        (err, data, fields) => {
            if (err) {
                console.log(err);
            }
            connection.query("select cat_id from itemstocat where item_id=?", [[req.params.id]], (err, item, fields) => {
                if (err) console.log(err);
            
            console.log('*******************');
            console.log(item);

            item = item.map(el => {
                return el.cat_id;
            });

            console.log(item);

            connection.query("SELECT * FROM category WHERE id in ?", [[item]],
            (err, thisa, fields) => {
                if (err) {
                    console.log(err);
                }
            console.log(thisa);
            console.log(item);
            console.log(data);
            res.render('item', {
                'item': data[0],
                'thisa': thisa,
                'params': req.params.id,
            })
        });
    });
    });
});


app.get('/add', isAuth, (req, res) => {
    res.render('add');
    
});

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
});
app.get('/catto/:id', (req,res) => {
    connection.query("select * from category", (err, data, fields) => {
        if (err) {
            console.log(err);
        }
        connection.query("select * from itemstocat where item_id=?", [[req.params.id]], (err, numb, fields) => {
            if (err) {
                console.log(err);
            }
        res.render('numb', {
            'data': data,
            'numb': numb,
            'params': req.params.id,
        });
    });
    });
});
app.post('/catadd', (req, res) => {
    function check(m, p) {
        for(let i = 0; i < m.length; i++) {
            if (p[i] == m[i].cat_id) return false;
        }
        return true;
    }
    connection.query("select cat_id from itemstocat where item_id=?", [[req.body.id]], (err, numb, fields) => {
        if (err) {
            console.log(err);
        }
    if (check(numb, req.body.catID)) {
        console.log(check(numb, req.body.catID))
    connection.query(
        "Insert into itemstocat (item_id, cat_id) values (?, ?)", [[req.body.id], [req.body.catID]], (err, data, fields) => {
            if (err) console.log(err);
            res.redirect('/catto/' + req.body.id);            
        }
    )
    } else {
        res.redirect('/catto/' + req.body.id);
    }
});
});
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
app.get('/catform', isAuth, (req, res) => {

        res.render('catadd', {
        });
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
});
app.post('/cat', (req, res) => {
    connection.query(
        "INSERT INTO category (name, descr) VALUES (?, ?)",
        [[req.body.name], [req.body.descr]],
        (err, data, fields) => {
            if (err) {
                console.log(err);
            }
            res.redirect('/');
        }
    );
});