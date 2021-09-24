// use tokio_amqp::*;
// use lapin::{
//     message::DeliveryResult, options::*, publisher_confirm::Confirmation, types::FieldTable,
//     BasicProperties, Connection, ConnectionProperties,Channel, Error
// };
use lapin::{ Connection, ConnectionProperties, Error, options::*,message::DeliveryResult,types::FieldTable};
use futures::executor::{block_on};
use std::str;

async fn tokio_main() -> Result<Connection, Error> {
    // let addr = std::env::var("AMQP_ADDR").unwrap_or_else(|_| "amqp://127.0.0.1:5672/%2f".into());
    let addr = dotenv::var("AMQP_ADDR").unwrap();

    let conn = Connection::connect(
        &addr,
        ConnectionProperties::default().with_default_executor(8),
    )
    .await?;
    
    println!("RabbitMQ connected");
    let _channel = conn.create_channel().await?;
    println!("Channel Created ");
    // Rest of your program
    let _queue = _channel
    .queue_declare(
        "hello",
        QueueDeclareOptions::default(),
        FieldTable::default(),
    )
    .await?;

    let channel_b = conn.create_channel().await.expect("create_channel");
    println!("status {:?}",conn.status().state());

    println!("will consume");
    let _channel_b = channel_b.clone();
    

        let a = channel_b
        .basic_consume(
            "hello",
            "my_consumer",
            BasicConsumeOptions::default(),
            FieldTable::default(),
        )
        .await
        .expect("basic_consume")
        .set_delegate(move |delivery: DeliveryResult| {
            // let channel = _channel_b.clone();
            async move {
                // println!("DDD {:?}", delivery);
                if let Ok(Some(delivery)) = delivery {
                    let (channel, delivery) = delivery;
                    // println!("{:?}", delivery.data);

                    let s = match str::from_utf8(&delivery.data) {
                        Ok(v) => v,
                        Err(e) => panic!("Invalid UTF-8 sequence: {}", e),
                    };
                
                    println!("result: {}", s);

                    channel
                        .basic_ack(delivery.delivery_tag, BasicAckOptions::default())
                        .await.expect("basic_ack");

                    //unsubscribe the channel
                    //    channel
                    //         .basic_cancel("my_consumer", BasicCancelOptions::default())
                    //         .await
                    //         .expect("basic_cancel");
                    }
                }
            });
            println!("cancel consume {:?}", a);


    println!("status {:?}",conn.status().state());

    Ok(conn)

//     //send channel
//     let channel_a = conn.create_channel().await.expect("create_channel");
//     //receive channel


//     //create the hello queue
//     let queue = channel_a
//         .queue_declare(
//             "hello",
//             QueueDeclareOptions::default(),
//             FieldTable::default(),
//         )
//         .await
//         .expect("queue_declare");
//         println!("status {:?}", conn.status().state());
//         println!("status {:?}", queue);

//         println!("will consume");
//         let channel = channel_b.clone();
//         let a = channel_b
//         .basic_consume(
//             "hello",
//             "my_consumer",
//             BasicConsumeOptions::default(),
//             FieldTable::default(),
//         )
//         .await
//         .expect("basic_consume")
//         .set_delegate(move |delivery: DeliveryResult| {
//             let channel = channel.clone();
//             async move {
//                 // println!("DDD {:?}", delivery);
//                 if let Ok(Some(delivery)) = delivery {
//                     let (channel, delivery) = delivery;
// println!("{:?}", delivery);
//                     channel
//                         .basic_ack(delivery.delivery_tag, BasicAckOptions::default())
//                         .await.expect("basic_ack");


//                     // delivery
//                     //     .ack(BasicAckOptions::default())
//                     //     .await
//                     //     .expect("basic_ack");
//                    channel
//                         .basic_cancel("my_consumer", BasicCancelOptions::default())
//                         .await
//                         .expect("basic_cancel");
//                     }
//                 }
//             });
//             println!("cancel consume {:?}", a);
//         println!("status {:?}",conn.status().state());

//         println!("will publish");
//         let payload = b"Hello world!";
//         let confirm = channel_a
//             .basic_publish(
//                 "",
//                 "hello",
//                 BasicPublishOptions::default(),
//                 payload.to_vec(),
//                 BasicProperties::default(),
//             )
//             .await
//             .expect("basic_publish")
//             .await
//             .expect("publisher-confirms");
//         assert_eq!(confirm, Confirmation::NotRequested);
//         println!("status {:?}",conn.status().state());    

        // Ok(channel_a)
}

pub fn call_ampq ()->Connection {
    block_on(tokio_main()).expect("error")
}