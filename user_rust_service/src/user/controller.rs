use lapin::{options::*, publisher_confirm::Confirmation, types::FieldTable,
        BasicProperties, Connection, Queue, Error};
use mongodb::{bson::doc, sync::Database};
use rocket::State;
use rocket_contrib::json;
use rocket_contrib::json::{Json, JsonValue};
use serde::{Deserialize, Serialize};

use futures::executor::block_on;

// use crate::DbConn;

const COLLECTION: &str = "users";

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct User {
    title: String,
    aouther: String,
}
/* function fo rabbitMQ create queue and publish the message */
pub async fn testing(_conn: &Connection)->Result<Queue,Error> {
    let _channel = _conn.create_channel().await?;
    println!("Channel Created ");
        //create the hello queue
        let queue = _channel
        .queue_declare(
            "hello",
            QueueDeclareOptions::default(),
            FieldTable::default(),
        )
        .await?;
    //  .expect("queue_declare");
    println!("Queue created");
    // println!("Queue: {:?}", queue);
                println!("will publish");
    let payload = b"Hello world33!";
    let confirm = _channel
        .basic_publish(
            "",
            "hello",
            BasicPublishOptions::default(),
            payload.to_vec(),
            BasicProperties::default(),
        )
        .await
        .expect("basic_publish")
        .await
        .expect("publisher-confirms");
    assert_eq!(confirm, Confirmation::NotRequested);


    Ok(queue)
    // match queue {
    //     Ok(q)=>q,
    //     Err(e)=>panic!("q{:?}", e)
    // }
}

#[get("/<_name>")]
pub fn get_user(_name: String, db: State<Database>, _conn: State<Connection>) -> JsonValue {
    // println!("inside controller {:?}", &_conn);
    let q = block_on(testing(&_conn));
    println!("outside {:?}",q);

    let d = all(&db);
    match d {
        Ok(d) => {
            // println!("{:?}", d);
            return json!({"status":true, "data":d});
        }
        Err(e) => println!("{:?}", e),
    };

    json!({"status":false, "error":"Some error in api"})
}
// #[get("/<name>/<age>")]
// pub fn get_user(name: String, age: u8) -> String {
//     // format!("Hello, {} year old named {}!", age, name)
// }

#[post("/insert", format = "json", data = "<user>")]
pub fn insert(user: Json<User>) -> JsonValue {
    println!("user {} ", user.title);
    json!({"status":true, "data":user.title})
}

pub fn test() {
    println!("calling modules");
}

pub fn all(database: &Database) -> Result<Vec<mongodb::bson::Document>, mongodb::error::Error> {
    let collection = database.collection(COLLECTION);
    let cursor = collection.find(doc! {}, None)?;
    let mut result: Vec<mongodb::bson::Document> = Vec::new();
    for ddoc in cursor {
        result.push(ddoc?);
    }
    Ok(result)
}
