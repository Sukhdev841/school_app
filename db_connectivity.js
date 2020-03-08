var sqlite3 = require('sqlite3').verbose();
const path = require('path')
const dbPath = path.resolve(__dirname, 'database/database.db')
var db = new sqlite3.Database(dbPath);

methods = 
{
    api_create_tables(logger)
    {
        console.log("In create table");
        var create_query = "CREATE TABLE if not exists students (\
            'id' Text primary key,\
            \"ਨਾਮ\" Text,\
             Name Text,\
            \"Father Name\" Text,\
            \"Mother Name\" Text,\
            \"ਪਿਤਾ ਦਾ ਨਾਮ\" Text,\
            \"ਮਾਤਾ ਦਾ ਨਾਮ\" Text,\
            Gender Text,\
            \"Date of Birth\" Text,\
            \"Date of Registration\" Text,\
            'Class' Text,\
            'ext' Text,\
            \"Adhaar Number\" Text,\
            \"Bank Account Number\" Text,\
            \"Bank Branch\" Text,\
            \"IFSC Code\" Text,\
            \"Fathers Occupation\" Text,\
            \"Income per Month\" Text,\
            \"Weight Registration\" Text,\
            \"Height Registration\" Text,\
            \"Physically Disable\" Text,\
            \"Have disablity certificate\" Text,\
            \"Caste\" Text,\
            \"Have caste certificate\" Text,\
            \"Marks_Grade in Last Class\" Text,\
            \"Comments\" Text\
            );"

            db.run(create_query);
            console.log("Query executed");
            logger.log({level: 'info',message:'Table students created.'})
            return;
        
        db.createTable('students',location,(succ,msg) => {
            // succ boolean tells if call is successfull
            console.log(msg)
            // if(succ)
            //     logger.log({level: 'info',message:'Table students created.'})
            // else
            //     logger.log({level: 'info',message:msg})
        })
    },

    api_insert_student(student_details,logger)
    {
        var insert_query = "insert into students(";
        var keyNames = Object.keys(student_details);
        //var values = Object.entries(student_details)
        for(i=0; i<keyNames.length; i++)
        {
            insert_query += '\"' + keyNames[i] + '\"';
            if( i < keyNames.length-1)
                insert_query += ','
        }
        insert_query += ') values ('
        var i = keyNames.length;
        for(var p in student_details)
        {
            insert_query += '\"' + student_details[p] + '\"'
            i--
            if( i > 0)
                insert_query += ','
        }

        insert_query += ');'

        console.log(insert_query)

        db.run(insert_query)
    },

    api_all_students(fields,logger,callback)
    {
        db.serialize(
            
            function()
            {
                //var select_all_query = "select * from students "+ ' order by Name;';
                var select_all_query = "select * from students order by Name limit " + fields['limit'] + ' offset ' + fields['offset'] + ';';
                db.all(select_all_query,function(err,rows)
                {
                    //console.log(rows)
                    callback(rows)
                })
            }
        )
    },

    api_get_count(fields,logger,callback)
    {
        db.serialize(
            function()
            {
                if( fields == null || fields == {})
                {
                    // case 1 : no search fields
                    var query = "select count(*) from students ;"
                    db.all(query,function(err,rows)
                    {
                        //console.log(rows)
                        callback(rows)
                    })
                    return;
                }
                var query = "select count(*) from students where ";
                var keyNames = Object.keys(fields);
                
                var i = keyNames.length;
                
                // case 2 : with search fields
                var j = 0;
                for(var p in fields)
                {
                    query += "\"" + keyNames[j] + "\"=\"" + fields[p] + '\"';
                    i--
                    if( i > 0)
                        query += ' AND '
                    j++;
                }
                query += ';'
                console.log(query)
                db.all(query,function(err,rows)
                {
                    //console.log(rows)
                    callback(rows)
                })
            }
        )    
    },

    api_get_students(fields,logger,callback)
    {
        db.serialize(
            function()
            {
                var limit = fields['limit']
                var offset = fields['offset']

                delete fields['limit']
                delete fields['offset']

                var query = "select * from students where ";
                var keyNames = Object.keys(fields);
                
                var i = keyNames.length;
                var j = 0;
                for(var p in fields)
                {
                    query += "\"" + keyNames[j] + "\"=\"" + fields[p] + '\"';
                    i--
                    if( i > 0)
                        query += ' AND '
                    j++;
                }
                query += ' order by Name '
                if( limit != null && offset != null)
                    query += ' limit ' + limit + ' offset ' + offset  ;
                query += ' ;'
                console.log(query)
                db.all(query,function(err,rows)
                {
                    //console.log(rows)
                    callback(rows)
                })
            }
        )   
    },

    api_delete_student(fields,logger,callback)
    {
        db.serialize(
            function()
            {
                var query = "delete from students where id = '" + fields['id'] +"';";

                console.log("executing " + query)
                
                db.run(query,function(err,rows)
                {
                    //console.log(rows)
                    if(callback)
                        callback(rows)
                })
            }
        )  
    }
}

module.exports = methods;
