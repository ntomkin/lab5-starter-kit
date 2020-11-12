const sqlite3 = require('sqlite3');

class Database {
    constructor(db_file) {
        this.db_file = db_file;

        // This checks if the "messages" table exists, and creates it if it doesn't
        this.db().get("SELECT name FROM sqlite_master WHERE type='table' AND name='messages';", (error, row) => {
            if(!row) {
                this.db().exec("CREATE TABLE IF NOT EXISTS messages (msgid INTEGER PRIMARY KEY, status TEXT NOT NULL, message TEXT NOT NULL, timestamp DATETIME DEFAULT CURRENT_TIMESTAMP);");
            }
        });
    }

    //  Provide access to the database for the class
    db() { 
        return new sqlite3.Database(this.db_file); 
    }

    //  Get all message from the database
    //  SELECT * FROM messages;
    async get_messages() { 
        let response_messages = [];
        return new Promise((resolve, reject) => {
            this.db().serialize(() => {
                this.db().each("SELECT * FROM messages;", (error, message) => {
                    if(!error) {
                        response_messages.push(message);
                    } else {
                        //  Provide feedback for the error
                        console.log(error);
                    }
                }, () => {
                    resolve(response_messages);
                });
            });
        });
    }

    //  Get a message from the database
    //  SELECT * FROM messages WHERE msgid = ?;
    async get_message(msgid) { 
        var return_value = false;
        return new Promise((resolve, reject) => {
            this.db().get("SELECT * FROM messages WHERE msgid = ?", [msgid], (error, row) => {
                if(!error) {
                    resolve(row);
                } else {
                    //  Provide feedback for the error
                    console.log(error);
                    resolve(false);
                }
            });
        });        
    }

    //  Add a message to the database
    //  INSERT INTO messages (status, message) VALUES (?, ?);
    async add_message(status, message) {
        var return_value = false;
        return new Promise((resolve, reject) => {
            this.db().run("INSERT INTO messages (status, message) VALUES (?, ?);", [status, message], async (error) => {
                if(!error) {
                    let last_message_id = await this.get_last_message_id();
                    if(last_message_id) {
                        let last_message = await this.get_message(last_message_id);
                        resolve(last_message);
                    } else {
                        resolve(false);
                    }
                } else {
                    //  Provide feedback for the error
                    console.log(error);
                    resolve(false);
                }
            });
        });        
    }

    //  Update a message in the database
    //  UPDATE messages SET status = ?, message = ? WHERE msgid = ?;
    async update_message(msgid, status, message) {
        var return_value = false;
        return new Promise((resolve, reject) => {
            console.log(msgid, status, message);
            this.db().run("UPDATE messages SET status = ?, message = ? WHERE msgid = ?", [status, message, msgid], (error) => {
                if(!error) {
                    resolve(true);
                } else {
                    //  Provide feedback for the error
                    console.log(error);
                    resolve(false);
                }
            });
        });
    }

    async get_last_message_id() {
        var return_value = false;
        return new Promise((resolve, reject) => {
            this.db().get("SELECT DISTINCT msgid FROM messages ORDER BY timestamp;", [], (error, row) => {
                if(!error) {
                    resolve(row.msgid);
                } else {
                    //  Provide feedback for the error
                    console.log(error);
                    resolve(false);
                }
            });
        });
    }

    //  Delete a message from the database
    //  DELETE FROM messages WHERE msgid = ?;
    async delete_message(msgid) {
        
    }

    //  Delete all messages from the database
    //  DELETE FROM messages;
    async delete_messages() {
        var return_value = false;
        return new Promise((resolve, reject) => {
            this.db().each("DELETE FROM messages;", (error, message) => {
                if(!error) {
                    return_value = true;
                } else {
                    //  Provide feedback for the error
                    console.log(error);
                    return_value = false;
                }
            }, () => {
                resolve(return_value);
            });
        });
    }
} 

module.exports = Database;