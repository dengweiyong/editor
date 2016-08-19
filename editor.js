/*
最简洁的html5文件上传插件 
20150616 gooddeng 采用jquery form
20160725 gooddeng 进一步简化,去掉jquery form，直接ajax，直接input.click

20160809 gooddeng 分离出webuploader方法，使调用方便，直接用函数实现，上传的元素上onclick=webuploader(this,{option});
*/
$.fn.webuploader = function (moption) {
    $(this).each(function () {
        var self = $(this);

        //触发选择文件
        self.click(function () {
            webuploader(this, moption)
        });
    });
};

function webuploader(el, moption) {
    var option = $.extend({
        url: '/manager/UploadImg.ashx?method=upload',
        acceptFiles: '*',
        filesize: 5,
        getParams: function () { return {}; },
        beforeSend: function (a, b, c) { },
        success: function (res) { }
    }, moption);


    var self = $(el);

    var fileInput = $("<input type='file'/>");
    fileInput.attr('accept', option.acceptFiles);

    //选择文件后即提交
    fileInput.change(function (evt) {
        var fileName = fileInput.val();

        var accepts = fileInput.attr('accept').toLowerCase();
        var ext = fileName.split('.').pop().toLowerCase();
        if (accepts != '*' && accepts.indexOf(ext) === -1) {
            jAlert('不允许此类型文件上传。');
            return;
        }

        if (this.files[0].size > option.filesize * 1024 * 1024) {
            jAlert('文件大小超过,限制:' + option.filesize + 'M');
            return;
        }

        //20160721 不再使用jQuery Form Plugin 直接html5 ajax式上传实现
        var formData = new FormData();
        /*添加参数*/
        var ParamData = option.getParams.call(self);
        for (var name in ParamData) {
            formData.append(name, ParamData[name]);
        }
        formData.append('file', this.files[0]);
        //submit
        $.ajax({
            url: option.url, type: 'POST', dataType: 'text', cache: false,
            data: formData,
            processData: false, contentType: false,
            beforeSend: function (x) {
                option.beforeSend.call(self, x);
            },
            success: function (response) {
                option.success.call(self, response);
            },
            error: function (t, r) {
                jAlert(r);
            }
        })
    }).click();

};
/*gooddeng 2016-07-21 在线编辑器*/
editor = {
    //工具条生成，重点。
    createToolbar: function () {
        var toolbar = $(['<div class="editToolbar unselectable">',
			'<div>',
				'<button class="button" onclick="editor.toggleMenu(this)" ><i class="icon-font-family"></i></button>',
				'<ul class="combox_menu" style="margin-top: -160px;">',
					'<li style="font-family:宋体" data-cmd="font-family" >宋体</li>',
					'<li style="font-family:仿宋" data-cmd="font-family" >仿宋</li>',
					'<li style="font-family:微软雅黑" data-cmd="font-family" >微软雅黑</li>',
					'<li style="font-family:黑体" data-cmd="font-family" >黑体</li>',
					'<li style="font-family:楷体" data-cmd="font-family" >楷体</li>',
					'<li style="font-family:隶书" data-cmd="font-family" >隶书</li>',
					'<li style="font-family:arial" data-cmd="font-family" >arial</li>',
					'<li style="font-family:arial black" data-cmd="font-family" >arial black</li>',
					'<li style="font-family:impact" data-cmd="font-family" >impact</li>',
					'<li style="font-family:times new roman" data-cmd="font-family" >times new roman</li>',
				'</ul>',
				'<button class="button" onclick="editor.toggleMenu(this)" ><i class="icon-font-size"></i></button>',
				'<ul class="combox_menu" style="margin-top: -240px;">',
					'<li style="font-size: 6pt" data-cmd="font-size">6 点</li>',
					'<li style="font-size: 7pt" data-cmd="font-size">7 点</li>',
					'<li style="font-size: 8pt" data-cmd="font-size">8 点</li>',
					'<li style="font-size: 9pt" data-cmd="font-size">9 点</li>',
					'<li style="font-size: 10pt" data-cmd="font-size">10 点</li>',
					'<li style="font-size: 11pt" data-cmd="font-size">11 点</li>',
					'<li style="font-size: 12pt" data-cmd="font-size">12 点</li>',
					'<li style="font-size: 13pt" data-cmd="font-size">13 点</li>',
					'<li style="font-size: 14pt" data-cmd="font-size">14 点</li>',
					'<li style="font-size: 15pt" data-cmd="font-size">15 点</li>',
					'<li style="font-size: 16pt" data-cmd="font-size">16 点</li>',
					'<li style="font-size: 18pt" data-cmd="font-size">18 点</li>',
					'<li style="font-size: 20pt" data-cmd="font-size">20 点</li>',
				'</ul>',
				'<button class="button" data-cmd="bold"><i class="icon-bold"></i></button>',
				'<button class="button" data-cmd="italic"><i class="icon-italic"></i></button>',
				'<button class="button" data-cmd="underline"><i class="icon-underline"></i></button>',
				'<button class="button" data-cmd="strikeThrough"><i class="icon-strikeThrough"></i>   </button>',
				'<button class="button" data-cmd="superscript"><i class="icon-superscript"></i></button>',
				'<button class="button" data-cmd="subscript"><i class="icon-subscript"></i></button>',
				'<button class="button" data-cmd="justifyLeft"><i class="icon-justifyLeft"></i></button>',
				'<button class="button" data-cmd="justifyCenter"><i class="icon-justifyCenter"></i></button>',
				'<button class="button" data-cmd="justifyRight"><i class="icon-justifyRight"></i></button>',
				'<button class="button" data-cmd="removeformat"><i class="icon-removeformat"></i></button>',
                '<div class="button" title="上传资料" onclick="editor.uploadFile(this)"><i class="icon-image"></i></div>',

				'<div class="clearfix"></div>',
			'</div>',
			'</div>'].join(''));

        //按钮click事件处理
        toolbar.click(function (e) {
            if ($(e.target).data('cmd')) {
                editor.exeCommand(e.target);
                e.stopPropagation();
            }
        });

        return toolbar;
    },

    uploadFile: function (el) {
        //定位的编辑区
        $(el).closest('.editor').find('[contenteditable]').focus();
        //文件上传实现
        webuploader(el, {
            url: '/Report/Report.ashx?method=upload',
            acceptFiles: '*',
            filesize: 6,
            success: function (response) {
                var res = response.split('|');
                if (res[0] == "1") {
                    var filename = res[1],
                        ext = filename.substr(filename.indexOf('.')).toLowerCase(),
                        html;
                    //如果是图片，显示图片
                    if (ext == ".jpg" || ext == ".bmp" || ext == ".gif" || ext == ".jpeg" || ext == ".png") {
                        html = '<img src="{0}" alt="图片" />'.format(filename);
                    } else {
                        var title = res.length > 2 ? res[2] : "点击下载附件";
                        html = '<a target="_blank" href={0}>{1}</a>'.format(filename, title);
                    }
                    document.execCommand('insertHTML', false, html);
                }
                else {
                    jAlert("上传失败,原因：" + res[1]);
                }
            }
        });
    },

    toggleMenu: function (et) {
        var pos = $(et).offset();

        /*pos.top = pos.top + $(et).outerHeight();
        pos.left = pos.left;
        pos.bottom = 'auto';
        pos.position = 'fixed';*/

        $(et).next()
            //.css(pos)
            .toggle();
    },

    wrapCss: function (cssname, cssvalue) {
        var spanString = $('<span/>', {
            'text': document.getSelection()
        }).css(cssname, cssvalue).prop('outerHTML');

        document.execCommand('insertHTML', false, spanString);
    },

    exeCommand: function (me) {
        var btn = $(me), cmd = btn.data('cmd');
        switch (cmd) {
            case "font-family":
            case "font-size":
                this.wrapCss(cmd, btn.css(cmd));

                btn.parent().hide();
                break;
            default:
                document.execCommand(cmd);
                break;
        }
    }
};

$.fn.editor = function (opt) {
    $.each(this, function () {
        var self = $(this);
        self.attr('contenteditable', 'true').css('overflow', 'auto').wrap('<div class="editor"></div>');
        editor.wrap = self.parent();
        editor.wrap.prepend(editor.createToolbar()).css('width', self.outerWidth());
    });
};