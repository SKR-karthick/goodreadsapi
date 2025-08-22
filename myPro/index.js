const express = require('express');
const app = express();
const path = require("path");
const { off } = require('process');
const {open} = require("sqlite")
const sqlite3 = require("sqlite3"); 
app.use(express.json())
const dbPath = path.join(__dirname,"goodreads.db")

let db = null

const initializeDbAndServer = async () =>{
    try{
        db = await open({
        filename:dbPath,
        driver:sqlite3.Database
    })
    app.listen(3000,() =>{
    console.log('Server is running on port http://localhost:3000');
});
    }
    catch(e){
        console.log(`DB Error ms ${e.message}`);
        process.exit(1);
    }
    
}

initializeDbAndServer()

app.get('/',(request,response)=>{
    response.send('Hello World!');
    console.log('Request received at /');
});


app.get('/date',(request,response)=>{
    const date = new Date();
    response.send(`Today date is ${date}`);
});


// app.get("/books/", async (req,res) =>{
//     const getBookQuery = `
//     select 
//     *
//     from
//     book
//     order by
//     book_id
//     `
//     const dbresponse = await db.all(getBookQuery)
//     res.send(dbresponse)
// })


app.get("/books/:id", async (req,res) =>{
    const {id} = req.params
    const getSingleBookQuery = 
    `SELECT 
       *
     from
     book
     WHERE
     book_id = ${id}
    `
    const dbresponse = await db.get(getSingleBookQuery)
    res.send(dbresponse)
})


app.post("/books/", async(req,res) =>{
    const bookDetails = req.body 
    const {title,author_id,rating,rating_count,review_count,description,pages,date_of_publication,edition_language,price,online_stores} = bookDetails
    const postQuery = `
    Insert into book(title,author_id,rating,rating_count,review_count,description,pages,date_of_publication,edition_language,price,online_stores)
    values(
     "${title}",
     ${author_id},
     ${rating},
     ${rating_count},
     ${review_count},
     "${description}",
     ${pages},
     "${date_of_publication}",
     "${edition_language}",
     ${price},
     "${online_stores}"
    )
    `
    const dbresponse = await db.run(postQuery)
    const bookId = dbresponse.lastID
    res.send({bookId:bookId})
})


app.put("/books/:bookId", async(req,res) =>{
    const {bookId} = req.params
    const bookDetails = req.body 
    const {title,rating,rating_count} = bookDetails
    const updateQuery = `
    UPDATE
    book
    SET
    title = '${title}',
    rating = ${rating},
    rating_count = ${rating_count}
    WHERE
    book_id = ${bookId}
    `
    const dbresponse = await db.run(updateQuery)
    res.send("Book Updated Successfully")
})


app.delete("/books/:bookId", async(req,res) =>{
    const {bookId} = req.params
    const deleteQuery = `
    DELETE FROM book
    WHERE book_id = ${bookId}
    `
    const dbresponse = await db.run(deleteQuery)
    res.send("Book Deleted Successfully")
})


app.get("/books/", async (req,res) =>{
    const {limit,offset,search_q="",order_by,order} = req.query
    const getBookQuery = `
    select 
    *
    from
    book
    where title LIKE "%${search_q}%" COLLATE NOCASE
    order by ${order_by} ${order}
    limit ${limit}
    offset ${offset}
    `
    const dbresponse = await db.all(getBookQuery)
    res.send(dbresponse)
})




