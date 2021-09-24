FROM rustlang/rust:nightly

RUN rustup show

WORKDIR /user_rust_service/src/app

COPY . .
COPY ./src/main.rs ./src/main.rs
COPY Cargo.lock .
COPY Cargo.toml .
# RUN cargo install --path .
RUN cargo build --release
RUN chmod a+x /user_rust_service/src/app

CMD ["cargo", "run", "--release"]