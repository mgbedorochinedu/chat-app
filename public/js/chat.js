const socket = io() 

//Manipulation the DOM
const $messageForm = document.querySelector("#message-form"); 
const $messageFormInput = document.querySelector("#input-msg"); 
const $messageFormButton = $messageForm.querySelector("button");
const $sendLocationBtn = document.querySelector("#send-location"); 
const $messages = document.querySelector("#messages"); 

//Templates
const messageTemplate = document.querySelector("#message-template").innerHTML;
const locationTemplate = document.querySelector("#location-template").innerHTML; 
const sidebarTemplate = document.querySelector("#sidebar-template").innerHTML;

//Option
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true }) 

//We create Autoscroll function 
const autoscroll = () => {
  //New message element
  const $newMessage = $messages.lastElementChild 

  //Height of the new message
  const newMessageStyle = getComputedStyle($newMessage) 
  const newMessageMargin = parseInt(newMessageStyle.marginBottom) 
  const newMessageHeight = $newMessage.offsetHeight + newMessageMargin 

//Visible height
const visibleHeight = $messages.offsetHeight 

//Height of messages container
const containerHeight = $messages.scrollHeight 

//This code checks how far we have scrolled
const scrollOffset = $messages.scrollTop + visibleHeight 

//We perform a conditional logic
      if(containerHeight - newMessageHeight <= scrollOffset) { 
              $messages.scrollTop = $messages.scrollHeight  
      }
}


//Message event
socket.on("message", (message) => { 
  console.log(message)

  const html = Mustache.render(messageTemplate, {
      username: message.username, 
      message: message.text, 
      createdAt: moment(message.createdAt).format('h:mm A') 
     })                                      
  $messages.insertAdjacentHTML('beforeend', html) 

    autoscroll() 
})

//locationMessage event
socket.on("locationMessage", (message) => {  
  console.log(message)

  const html = Mustache.render(locationTemplate, {
    username: message.username, 
    url: message.url, 
    createdAt: moment(message.createdAt).format('h:mm A') 
  }) 
  $messages.insertAdjacentHTML('beforeend', html) 

  autoscroll() 
 }) 



 //This code is responsible for rendering "room" & "users" on the sidebar of our chat-app
  socket.on("roomData", ({ room, users }) => { 

    const html = Mustache.render(sidebarTemplate, {  
      room,
      users
    })
   document.querySelector("#sidebar").innerHTML = html 
  })                                                                              
 
 $messageForm.addEventListener("submit", (e) => { 
    e.preventDefault()   
    $messageFormButton.setAttribute('disabled', 'disabled') 

   const message = e.target.elements.message.value 

    socket.emit("sendMessage", message, (error) => { 
      $messageFormButton.removeAttribute("disabled")  

        $messageFormInput.value = ""

        $messageFormInput.focus() 

            if(error){ 
              return console.log(error)
            }
        console.log("Message delivered!") 
    }) 
})

//This code shares users location 
$sendLocationBtn.addEventListener("click", () => { 

  $sendLocationBtn.setAttribute("disabled", "disabled")  
  
     if(!navigator.geolocation) { 
        return alert("Geolocation is not supported by your browser") 
     }
      navigator.geolocation.getCurrentPosition( (position) => { 
       
          socket.emit("sendLocation", { 
          latitude: position.coords.latitude, 
          longitude: position.coords.longitude
          }, () => { 
            $sendLocationBtn.removeAttribute("disabled")
            console.log("Location shared") 
          })
  })                        
})

//Emitting an event when a user join
socket.emit("join", { username, room }, (error) => { 
      
      if(error){ 
          alert(error) 
          location.href = '/' 
        }
}) 




