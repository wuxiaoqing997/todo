var log = console.log.bind(console, '*** ')
var e = function(sel) {
    return document.querySelector(sel)
}
var toggleClass = function(element, className) {
    if (element.classList.contains(className)) {
        element.classList.remove(className)
    } else {
        element.classList.add(className)
    }
}
var flag_list = e('.timeline')
var add_panel = e('#add')
var add_click = function(){
    add_panel.addEventListener('click',function(){
        log('click')
        var add_in = e('.add')
        toggleClass(add_in,show);
    })
}
var appendHtml = (element, html) => element.insertAdjacentHTML('beforeend', html)
var ajax = function(method, path, data, reseponseCallback) {
    var r = new XMLHttpRequest()
        // 设置请求方法和请求地址
    r.open(method, path, true)
        // 设置发送的数据的格式
    r.setRequestHeader('Content-Type', 'application/json')
        // 注册响应函数
    r.onreadystatechange = function() {
            if (r.readyState === 4) {
                // reseponseCallback 服务器返回的信息
                reseponseCallback(r.response)
            }
        }
        // 处理 data
    data = JSON.stringify(data, null, 2)
        // 发送请求
    r.send(data)
}

var templateTodo = todo => {
    var task = todo.task
    var id = todo.id
    var t = `
       <li>
                        <div class="direction-r">
                            <div class="flag-wrapper" data-id='${id}'>
                                <span class="flag">${task}</span>
                                <div id="img-list">
                                     <img src="static_files/imgs/pen.png" class="pen">
                                    <img src="static_files/imgs/com.png" class="com">
                                    <img src="static_files/imgs/del.png" class="del">
                                </div>
                            </div>
                        </div>
                    </li>
    `

    return t
}

var insertTodo = todo => {
    var html = templateTodo(todo)
    log(todo)
    appendHtml(flag_list, html)
}

var insertTodos = todos => {
    log(todos.length)
    log(typeof todos)
    var list = JSON.parse(todos)
    for (var i = 0; i < list.length; i++) {
        var todo = list[i]
        insertTodo(todo)
    }
}
var apiTodoAll = callback => {
    var method = 'GET'
    var path = '/todo/all'
    var data = {}
    ajax(method, path, data, callback)
}

var apiTodoAdd = (task, callback) => {
    var method = 'POST'
    var path = '/todo/add'
    var data = {
        task: task
    }
    ajax(method, path, data, callback)
}

var apiTodoDelete = (id, callback) => {
    var method = 'GET'
    var path = '/todo/delete/' + id
    var data = {}
    ajax(method, path, data, callback)
}
var yes = e('#yes')
var no = e('#no')
var InsertDate = function() {
    yes.addEventListener('click', function() {
        var insert = e('textarea').value
        apiTodoAdd(insert, function(insert) {
            log(insert)
        })
        apiTodoAll(function(data) {
            log(data)
            var list = JSON.parse(data)
            var len = list.length
            insertTodo(list[len - 1])
        })

    })
    no.addEventListener('click',function(){
        e('textarea').value = ' '
    })
}
var bindEventDelete = () => {
    var container = e('.timeline')
    container.addEventListener('click', function(event) {
        var self = event.target
        if (self.classList.contains('del')) {
            log('button click, delete')
            var self = event.target
            var todoCell = self.closest('.flag-wrapper')
                // 拿到 todo_id
                // 在事件中调用删除函数, 获取 todo_id 并且传给删除函数
                // 用 ajax 发送给服务器
            var todoId = todoCell.dataset.id
            apiTodoDelete(todoId, function(todo) {
                log('删除成功', todo)
                    // 删除后, 删除页面元素
                todoCell.remove()
            })
        }
    })
}

var bindEventComplete = () => {
    var container = e('.timeline')
    container.addEventListener('click', function(event) {
        var self = event.target
        if (self.classList.contains('com')) {
            log('button click, complete')
            var self = event.target
            var todoCell = self.closest('.flag-wrapper')
            var task = todoCell.querySelector('.flag')
            task.classList.add('comp')
        }
    })
}

var bindEventEdit = () => {
    // 绑定 edit 按钮的事件委托
     var container = e('.timeline')
    container.addEventListener('click', function(event){
        var self = event.target
        if (self.classList.contains('pen')) {
            log('button click, edit')
            // 找到 todo-task, 设置 contenteditable 属性, 并且让它获得焦点
            var self = event.target
            var todoCell = self.closest('.flag-wrapper')
            var task = todoCell.querySelector('.flag')
            task.contentEditable = true
            task.focus()
        }
    })
}

var bindEventUpdate = () => {
     var container = e('.timeline')
    // 绑定 keydown 事件, 当用户按键的时候被触发
    container.addEventListener('keydown', function(event){
        var self = event.target
        if (self.classList.contains('flag')) {
            if (event.key == 'Enter') {
                log('按了回车键', event)
                // 取消事件的默认行为, 回车键在编辑标签内容的时候会默认断行
                event.preventDefault()
                // 取消 editable 状态, 发送 update 的请求
                self.contentEditable = false
                var todoCell = self.closest('.flag-wrapper')
                var todoId = todoCell.dataset.id
                // var url = 'https://vip.cocode.cc/sandbox/todo/3400711034/update/' + todoId
                var data = {
                    'task': self.innerHTML,
                }
                apiTodoUpdate(todoId, data, function(todo){
                    log('更新成功')
                })
            }
        }
    })
}

var __main = function() {
    add_click()
    apiTodoAll(function(data) {
        log(data)
        insertTodos(data)
    })
    InsertDate()
    bindEventDelete()
    bindEventComplete()
    bindEventEdit()
    bindEventUpdate()
}

__main()
