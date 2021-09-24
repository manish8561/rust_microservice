
use webservice::rocket;
// use std::sync::Arc;
// use tokio::runtime::Runtime;

fn main() {
    let error = rocket().launch();
    println!("Whoops! Rocket didn't launch! {}", error);
    drop(error);
  
}