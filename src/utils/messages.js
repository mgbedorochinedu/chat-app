//Create generateMessage function
const generateMessage = (username, text) => { 
        return { 
            username, 
            text, 
            createdAt: new Date().getTime() 
        }
}  

//Create generateLocationMessage function
const generateLocationMessage = (username, url) => { 
    return {
        username,
        url,
        createdAt: new Date().getTime()
    }
}

//Exports functions
module.exports = { 
    generateMessage,
    generateLocationMessage 
}