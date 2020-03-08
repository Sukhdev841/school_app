const {app, BrowserWindow} = require('electron') 
const url = require('url') 
const path = require('path')  
const winston = require('winston')
const {ipcMain} = require('electron')
const electron = require('electron')
const fs = require('fs')
const Menu = electron.Menu;
//const Menu = electron.Menu;

const db_methods = require('./db_connectivity');

const { createLogger, format, transports } = require('winston');
const { combine, timestamp, label, prettyPrint } = format;

winston.format.combine(
   winston.format.colorize(),
   winston.format.json()
 );

const logger = createLogger({
  format: combine(
    timestamp(),
    prettyPrint(),
    winston.format.colorize()
  ),
  transports: [
   new winston.transports.File({
      filename: 'combined.log',
      format: winston.format.combine(
         winston.format.simple(),
         winston.format.colorize()
       )
      
    }),
    new transports.Console({
       name: 'console',
      format: winston.format.combine(
                winston.format.simple(),
                winston.format.colorize()
              )
    })
   ]
})

//logger.transports['console'].silent = true;

let primary_window  

function url_loader(win,page_path)
{
   win.loadURL(url.format ({ 
      pathname: path.join(__dirname, page_path), 
      protocol: 'file:', 
      slashes: true 
   })) 
}

function show_menu_bar()
{
   const template = [
      {
         label : 'Search',
         click: function(){ search_window() }
      },
      {
         label : 'Insert',
         click : function() { insert_window()}
      }
   ]
   
   const menu = Menu.buildFromTemplate(template)
   Menu.setApplicationMenu(menu)
}

function search_window()
{
   url_loader(primary_window,'res/search.html')
}

function insert_window()
{
   url_loader(primary_window,'res/insert.html')
}

function about_window()
{
   url_loader(primary_window,'res/about.html')
}

function createWindow(url,max_size,callback) { 
   var win = new BrowserWindow({show:false}) 
   win.setMenu(null)
   if(max_size)
      win.maximize()
   else
      win.setSize(1250,500);
   
   win.show()
   url_loader(win,url)
   callback(win)
}  

function profile_picture_exists(id,ext)
{
   image_path = path.resolve(__dirname, 'res/images/'+id+'.'+ext)
   try{
      if(fs.existsSync(image_path)){
         console.log("Profile picture exists with name : " + id + "."+ext)
         return true
      }
      else
      {
         console.log("Profile picture doesn't exists with name : " + id + "."+ext)
         return false
      }
   }
   catch(err){
      console.log(err)
      return false
   }
   return false
}

ipcMain.on('asynchronous-message', (event, arg) => {
   console.log(arg);
   show_menu_bar();

   if(arg.all_student_count)
   {
      db_methods.api_get_count(arg.args,logger,function(count){
         // sending reply
         event.sender.send('asynchronous-reply',{all_student_count_reply:true,count:count[0]['count(*)']})
      })
   }
   else if(arg.get_all_students)
   {
      db_methods.api_all_students(arg.args,logger,function(rows)
      {
         // console.log(rows);      // for debug only
         // check if image for student exists or not
         for(i=0; i<rows.length; i++)
         {
            if(profile_picture_exists(rows[i]["id"],rows[i]["ext"]))
               rows[i].profile_picture_exists=true;
            else
               rows[i].profile_picture_exists=false;
         }
         event.sender.send('asynchronous-reply', {all_students_reply : true, data : rows})
      })
   }
   else if(arg.search_student_count)
   {
      db_methods.api_get_count(arg.args,logger,function(count){
         // sending reply
         event.sender.send('asynchronous-reply',{search_student_count_reply:true,count:count[0]['count(*)']})
      })
   }
   else if(arg.search_student)
   {
      db_methods.api_get_students(arg.args,logger,function(rows)
      {
         
         // check if image for student exists or not
         for(i=0; i<rows.length; i++)
         {
            if(profile_picture_exists(rows[i]["id"],rows[i]["ext"]))
               rows[i].profile_picture_exists=true;
            else
               rows[i].profile_picture_exists=false;
         }
         console.log(rows);
         event.sender.send('asynchronous-reply', {search_student_reply : true, data : rows})
      }) 
   }
   else if(arg.show_student)
   {
      // show data to user
      createWindow('res/edit.html',false,function(win){
         var fields = {id : arg.id}
         db_methods.api_get_students(fields,logger,function(rows){
            //console.log(rows)
            console.log("Data fetched from database and sending to edit window")
            fields = {data : rows[0]}
            //console.log(fields)
            win.webContents.on('did-finish-load', () => {
               win.webContents.send('store-data',fields);
             })
            
         })
      });
      
   }

   else if(arg.get_count)
   {
      db_methods.api_get_count(arg.object,function(rows)
      {
         console.log(rows);
         event.sender.send('asynchronous-reply', { query_count: true, count : rows})
      })
   }
   else if(arg.change_page)
   {
      console.log('request to change path or page')
      url_loader(primary_window,arg.url)
   }
   else if(arg.insert)
   {
      arg.object['ext'] = null;
      if(arg.object['image_path'] != null)
      {
         var image_file = arg.object['image_path']
         var output_file = path.join('res','images',arg.object['id'] +'.' + image_file.toString().split('.').pop());
         var output_file = path.join(__dirname, output_file);
         arg.object['ext'] = image_file.toString().split('.').pop();
         console.log("inserting data and copying image")
         console.log(image_file)
         console.log(output_file)
         fs.createReadStream(image_file).pipe(fs.createWriteStream(output_file));
      }
      
      delete arg.object['image_path']
      console.log(arg.object)
      db_methods.api_insert_student(arg.object,logger)
   }
   else if(arg.update)
   {
      console.log("Updating")
      db_methods.api_delete_student(arg.object,logger)
      arg.object['ext'] = null;
      if(arg.object['image_path'] && arg.object['image_path'][0] != null && !arg.object['image_path'][0].includes(arg.object['id']))
      {
         var image_file = arg.object['image_path'][0]
         var output_file = path.join('res','images',arg.object['id'] +'.' + image_file.toString().split('.').pop());
         var output_file = path.join(__dirname, output_file);
         arg.object['ext'] = image_file.toString().split('.').pop();
         console.log("coyping during update")
         console.log(image_file)
         console.log(output_file)
         fs.createReadStream(image_file).pipe(fs.createWriteStream(output_file));
      }
      else if( arg.object['image_path'] && arg.object['incoming_path'] != null && arg.object['image_path'][0] != arg.object['incoming_path'] )
      {
         // delete image from file
         console.log("Need to delete file (not implemented yet)")
         fs.unlink(path.join(__dirname,'res',arg.object['incoming_path']))
      }
      
      delete arg.object['image_path']
      delete arg.object['incoming_path']
      console.log(arg.object)
      db_methods.api_insert_student(arg.object,logger)
   }
   else if(arg.delete)
   {
      // also delete corresponding profile pic if exists

      db_methods.api_get_students(arg.object,logger,function(rows){
         console.log("Searched before deleting : ")
         console.log(rows)
         if(profile_picture_exists(rows[0]["id"],rows[0]["ext"]))
         {
            console.log("Need to delete profile pic also.")
            fs.unlink(path.join(__dirname,'res','images',rows[0]["id"]+'.'+rows[0]["ext"]))
         }      
         else
            console.log("Profile pic doesn't exists.")
      })
      db_methods.api_delete_student(arg.object,logger)
   }

   else if(arg.dialog)
   {
      electron.dialog.showOpenDialog({ properties: [ 'openFile']},function(file)
      {
         if(file)
         {
            // send this file to front end
            var obj = {
               show_image : true,
               image_path :  file
            }
            event.sender.send('asynchronous-reply', obj)
         }
      });
   }
   else if(arg.snackbar_message)
   {
      url_loader(primary_window,'res/search.html')
      primary_window.webContents.send('asynchronous-reply',{show_snackbar:true, message: arg.message})
   }
   // Event emitter for sending asynchronous messages
   //event.sender.send('asynchronous-reply', 'async pong')
})

// Event handler for synchronous incoming messages
ipcMain.on('synchronous-message', (event, arg) => {
   console.log(arg) 

   // Synchronous event emmision
   event.returnValue = 'sync pong'
})

app.on('ready', function(){ 
   createWindow('res/index.html',true,function(win){
      primary_window = win;
   });

   db_methods.api_create_tables(logger);
})