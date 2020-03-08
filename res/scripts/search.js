const {ipcRenderer} = require('electron')
const path = require('path')  
window.$ = window.jQuery = require('jquery')

var total_count = 0;
var offset = 0;
var limit = 2;
var search_fields = {};
var current_page = 0;

function show_snackbar(message) {
    var x = document.getElementById("snackbar");
    $("#snackbar").html(message);
    x.className = "show";
    setTimeout(function(){ x.className = x.className.replace("show", ""); }, 3000);
}

function add_card(obj)
{   
    var html = "<div onclick=\"clicked('"+obj['id']+"');\" class=\"unit\">"
    html += "<div class=\"details\"><div class=\"clearing\">";

    html += "<div class=\"field\">" + obj["Name"] + "/" + obj["ਨਾਮ"] + "</div><div class=\"line\"></div>"
    html += "<div class=\"field\">Class / ਜਮਾਤ : " + obj["Class"] + "</div><div class=\"line\"></div>"
    html += "<div class=\"field\"> Father's Name / ਪਿਤਾ ਦਾ ਨਾਮ :" + obj["Father Name"] +"/"+ obj["ਪਿਤਾ ਦਾ ਨਾਮ"] + "</div><div class=\"line\"></div>"
    html += "<div class=\"field\">Gender / ਲਿੰਗ : "+ obj['Gender']+"</div><div class=\"line\"></div>"
    html += "<div class=\"field\">Date of Birth / ਜਨਮ ਮਿਤੀ : "+ obj["Date of Birth"] +"</div><div class=\"line\"></div>"

    html += "</div></div>"
    var p = path.join('images',obj["id"]+'.' + obj["ext"]);
    html += "<div class=\"pic\"><img class=\"profile_img\" alt='No Image' src=\""+p+"\"/></div>" 
    html += "</div>"
    $("#background").append(html);
}

function set_pagination()
{
    if(total_count > 1)
        $("#query_count").html(total_count + ' student records found.');
    else
        $("#query_count").html(total_count + ' student record found.');
    $("#current_page").html(current_page)
    if(current_page ==  1)
        $("#previous_page").hide();
    else
        $("#previous_page").show();

    if(current_page <  Math.ceil( total_count/limit))
        $("#next_page").show();
    else
        $("#next_page").hide();
}

ipcRenderer.on('asynchronous-reply', (event, arg) => {
    
    if(arg.all_students_reply)
    {
        // set pagination appropriately
        //offset = offset + limit
        $("#background").html(null)
        //ipcRenderer.send('asynchronous-message', {data: "hello"});
        for(i=0; i<arg.data.length; i++)
            add_card(arg.data[i]);

    }
    else if(arg.all_student_count_reply)
    {
        // got count of total students
        total_count = arg.count;
        current_page = 1;
        set_pagination();
        ipcRenderer.send('asynchronous-message', {get_all_students: true,args:{offset: offset, limit : limit}});
    }
    else if(arg.search_student_count_reply)
    {
        total_count = arg.count;
        current_page = 1;
        set_pagination();
        search_fields['limit'] = limit;
        search_fields['offset'] = offset;
        ipcRenderer.send('asynchronous-message', {search_student: true,args:search_fields});
    }
    else if(arg.search_student_reply)
    {
        //offset = offset + limit
        $("#background").html(null)
        //ipcRenderer.send('asynchronous-message', {data: "hello"});
        for(i=0; i<arg.data.length; i++)
            add_card(arg.data[i]);
    }
    else if(arg.show_snackbar)
    {
        show_snackbar(arg.message);
    }
})

function clicked(id)
{
    ipcRenderer.send('asynchronous-message', {show_student : true, id: id});
}

function search()
{
    //ipcRenderer.send('asynchronous-message', {search:true, search_fields: search_fields});

    //$('.search_fields')[0];
    search_fields = {};
    var obj = {};
    $('#form').find("input").each(function(){

            if($(this).val() != null && $(this).val() != '')
                search_fields[$(this).attr('name')] = $(this).val()
    })

    //search_fields = $('select');
    $('select').each(function(){
        if($(this).val() != null && $(this).val() != '')
            search_fields[$(this).attr('name')] = $(this).val()
    })

    offset = 0;
    current_page = 1;

    if( jQuery.isEmptyObject(search_fields) )
    {
        ipcRenderer.send('asynchronous-message', {all_student_count: true});
        return;
    }

    search_fields['limit'] = limit;
    search_fields['offset'] = 0;

    ipcRenderer.send('asynchronous-message', {search_student_count:true, args: search_fields});
}

function next_page()
{
    current_page = current_page + 1;
    offset += limit;
    set_pagination();
    
    if( jQuery.isEmptyObject(search_fields) )
    {
        ipcRenderer.send('asynchronous-message', {get_all_students: true,args:{offset: offset, limit : limit}});
        return;
    }
    search_fields['limit'] = limit;
    search_fields['offset'] = offset;
    ipcRenderer.send('asynchronous-message', {search_student: true,args:search_fields});
}

function previous_page()
{
    current_page = current_page - 1;
    offset -= limit;
    set_pagination();
    
    if( jQuery.isEmptyObject(search_fields) )
    {
        ipcRenderer.send('asynchronous-message', {get_all_students: true,args:{offset: offset, limit : limit}});
        return;
    }
    search_fields['limit'] = limit;
    search_fields['offset'] = offset;
    ipcRenderer.send('asynchronous-message', {search_student: true,args:search_fields});
}


ipcRenderer.send('asynchronous-message', {all_student_count: true});        // first message to main process
