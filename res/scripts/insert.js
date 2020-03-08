const {ipcRenderer} = require('electron')
const path = require('path')
window.$ = window.jQuery = require('jquery')
const md5 = require('md5')
const remote = require('electron').remote;


var image_path = null;
var incoming_path = null;
var student_id= null;

var data = {}

ipcRenderer.on('asynchronous-reply', (event, arg) => {
    
        if(arg.show_image)
        {
            document.getElementById("profile_pic").setAttribute("src", arg.image_path);
            image_path = arg.image_path[0];
        }
    })

function send_form()
{
    var name_box = $('.name_box')[0];
    var obj = {};
    $(name_box).find("input").each(function(){
            name = $(this).attr('name')
            val = $(this).val()
            obj[name] = val
    })

    name_box = $('.bottom_box')[0];
    $(name_box).find("input").each(function(){
            name = $(this).attr('name')
            val = $(this).val()
            obj[name] = val
    })

    //name_box = $('select');
    $('select').each(function(){
            name = $(this).attr('name')
            val = $(this).val()
            obj[name] = val
    })

    $('textarea').each(function(){
            name = $(this).attr('name')
            val = $(this).val()
            obj[name] = val
    })

    obj['id'] = md5(JSON.stringify(obj))
    obj['image_path'] = image_path;
    ipcRenderer.send('asynchronous-message', {insert:true,object:obj});
    ipcRenderer.send('asynchronous-message', {snackbar_message:true,message:"Record Created"});
    
}

function select_image()
{
    ipcRenderer.send('asynchronous-message', {dialog:true});
}

function remove_image()
{
    document.getElementById("profile_pic").setAttribute("src", "");
    image_path = null;
}

function deleteImage()
{
    // alert("Pic removed");
    document.getElementById("profile_pic").setAttribute("src", "");
    document.getElementById("profile_pic_input").value = null;
    document.getElementById("remove_image").value = '1';
}

function caste_updated(obj)
{
    ipcRenderer.send('asynchronous-message', {alpha_check:true, caste: true,temp:obj.value});
    if( obj.value == "General")
    {
        document.getElementById("caste_certificate").setAttribute("hidden","true");
    }
    else
    {
        document.getElementById("caste_certificate").removeAttribute("hidden");
    }
}

function disability_updated(obj)
{
    // alert(obj.value);
    ipcRenderer.send('asynchronous-message', {alpha_check:true, disablity: true, temp:obj.value});
    if( obj.value == 'Yes/ ਹਾਂ')
    {
        document.getElementById("disabilitiy_certificate").removeAttribute("hidden");
    }
    else
    {
        document.getElementById("disabilitiy_certificate").setAttribute("hidden","true");
    }
}

function print_record()
{
    $(".is_a_button").css("visibility","hidden");
    window.print();
    $(".is_a_button").css("visibility","visible");
}

ipcRenderer.on('store-data',function(event,data_){
    // incoming data
    data = data_;
    //ipcRenderer.send('asynchronous-message', {data_reached:data});
    
    //ipcRenderer.send('asynchronous-message', {itsdone:units});
    var name_box = $('.name_box')[0];
    $(name_box).find("input").each(function(){
        
        $(this).val( data.data[$(this).attr('name')])
    })

    name_box = $('.bottom_box')[0];
    $(name_box).find("input").each(function(){
        $(this).val( data.data[$(this).attr('name')])
    })

    //name_box = $('select');
    $('select').each(function(){
            $(this).val( data.data[$(this).attr('name')])
            if($(this).attr('id') == 'disability_div')
            $(this).change();
            else if($(this).attr('id') == 'caste_div')
                $(this).change();
    })

    $('textarea').each(function(){
        $(this).val( data.data[$(this).attr('name')])
        
    })
    document.getElementById("profile_pic").setAttribute("src", path.join("images",data.data['id']+'.'+data.data['ext']));
    image_path = path.join("images",data.data['id']+'.'+data.data['ext'])
    incoming_path = image_path
    student_id = data.data['id']
    ipcRenderer.send('asynchronous-message', {id_given:data.data['id']});
    
    //ipcRenderer.send('asynchronous-message', {itsdone:image_path});

    // $(document).ready(function(){
    //     caste_updated($("#caste_div"));
    //     disability_updated($("#disability_div"));
    // })

})

function update_record()
{
    var name_box = $('.name_box')[0];
    var obj = {};
    $(name_box).find("input").each(function(){
            name = $(this).attr('name')
            val = $(this).val()
            obj[name] = val
    })

    name_box = $('.bottom_box')[0];
    $(name_box).find("input").each(function(){
            name = $(this).attr('name')
            val = $(this).val()
            obj[name] = val
    })

    //name_box = $('select');
    $('select').each(function(){
            name = $(this).attr('name')
            val = $(this).val()
            obj[name] = val
    })

    $('textarea').each(function(){
            name = $(this).attr('name')
            val = $(this).val()
            obj[name] = val
    })

    obj['image_path'] = [image_path];
    obj['incoming_path'] = incoming_path
    obj['id'] = student_id
    ipcRenderer.send('asynchronous-message', {update:true,object:obj});
    ipcRenderer.send('asynchronous-message', {snackbar_message:true,message:"Record Updated"});
    var window = remote.getCurrentWindow();
       window.close();
}

function delete_record()
{
    var obj = {};
    obj['id'] = student_id
    ipcRenderer.send('asynchronous-message', {delete:true,object:obj});
    ipcRenderer.send('asynchronous-message', {snackbar_message:true,message:"Record Deleted"});
    var window = remote.getCurrentWindow();
       window.close();
}