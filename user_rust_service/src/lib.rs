#![feature(proc_macro_hygiene, decl_macro)]
#[macro_use]
extern crate rocket;
extern crate dotenv;

use rocket::{Request, Rocket};
use rocket_contrib::json;
use rocket_contrib::json::JsonValue;

pub mod ampq;
pub mod db;
pub mod user;

#[get("/status")]
fn check() -> JsonValue {
    json!({"status":true, "message":"Rust service is working.."})
}

#[catch(500)]
fn internal_error() -> &'static str {
    "Whoops! Looks like we messed up."
}

#[catch(400)]
fn unauthorized(req: &Request) -> String {
    format!("Unauthorised access {}", req.uri())
}
#[catch(404)]
fn not_found(req: &Request) -> String {
    format!("I couldn't find '{}'. Try something else?", req.uri())
}
#[catch(422)]
fn unprocessed(req: &Request) -> String {
    format!("Unprocessed Entity {}", req.uri())
}

//call function from main file
pub fn rocket() -> Rocket {
   
    rocket::ignite()
        .manage(db::connect())
        .manage(ampq::call_ampq())
        .mount("/v1/userrust", routes![check])
        .mount(
            "/v1/userrust/user",
            routes![user::controller::get_user, user::controller::insert],
        )
        .register(catchers![
            internal_error,
            unauthorized,
            not_found,
            unprocessed
        ])
}
