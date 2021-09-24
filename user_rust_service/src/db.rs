use mongodb::sync::{Client, Database};
// use rocket::http::Status;
// use rocket::request::{self, FromRequest};
// use rocket::{Outcome, Request, State};

fn init() -> Result<Database, mongodb::error::Error> {
    let mongo_url = dotenv::var("MONGO_URL").unwrap();

    let client = Client::with_uri_str(&mongo_url)?;

    let database = client.database("mydb");
    println!("Mongodb connected");
    Ok(database)
}

// mongodb connection
pub fn connect() -> Database {
    let database = init();
    match database {
        Ok(database) => database,
        Err(e) => panic!("error {}", e),
    }
}

/*
    Create a implementation of FromRequest so Conn can be provided at every api endpoint
*/
// impl<'a, 'r> FromRequest<'a, 'r> for DbConn {
//     type Error = ();

//     fn from_request(request: &'a Request<'r>) -> request::Outcome<DbConn, ()> {
//         let db = request.guard::<State<DbConn>>()?;
//         match db {
//             Ok(db) => Outcome::Success(db),
//             Err(_) => Outcome::Failure((Status::ServiceUnavailable, ())),
//         }
//     }
// }

// /*
//     When Conn is dereferencd, return the mongo connection.
// */
// impl Deref for DbConn {
//     type Target = Database;

//     fn deref(&self) -> &Self::Target {
//         &self.0
//     }
// }
