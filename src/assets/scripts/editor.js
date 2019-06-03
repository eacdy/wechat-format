var app = new Vue({
    el: '#app',
    data: function () {
        return {
            title: 'Markdown to WeChat Article',
            aboutOutput: '',
            output: '',
            source: '',
            editorThemes: ['base16-light', 'monokai'],
            currentEditorTheme: 'base16-light',
            editor: null,
            builtinFonts: [
                {
                    label: '衬线',
                    value: 'serif',
                    fonts: "Optima-Regular, Optima, PingFangSC-light, PingFangTC-light, 'PingFang SC', Cambria, Cochin, Georgia, Times, 'Times New Roman', serif"
                },
                {
                    label: '无衬线',
                    value: 'sans-serif',
                    fonts: "Roboto, Oxygen, Ubuntu, Cantarell, PingFangSC-light, PingFangTC-light, 'Open Sans', 'Helvetica Neue', sans-serif"
                }
            ],
            currentFont: {
                label: '', value: ''
            },
            aboutDialogVisible: false
        }
    },
    mounted() {
        var self = this
        this.editor = CodeMirror.fromTextArea(document.getElementById('editor'), {
            lineNumbers: false,
            lineWrapping: true,
            styleActiveLine: true,
            theme: this.currentEditorTheme,
            mode: 'text/x-markdown',
        });
        this.editor.on("change", function (cm, change) {
            self.refresh()
        })
        this.currentFont = this.builtinFonts[0]
        this.wxRenderer = new WxRenderer({
            theme: defaultTheme,
            fonts: this.currentFont.fonts
        })
        axios({
            method: 'get',
            url: './assets/default-content.md',
        }).then(function (resp) {
            self.editor.setValue(resp.data)
        })
    },
    methods: {
        renderWeChat: function (source) {
            var output = '<small style="text-align: center;display:block; color: #3f3f3f;">点击上方<b style="color: rgb(0, 82, 255);">"IT牧场"</b>，选择<b style="color: rgb(0, 82, 255);">"置顶或者星标"</b></small>\n' +
                '<small style="text-align: center;display:block; color: #3f3f3f;">技术干货每日送达！</small><br>';


            output = output + marked(source, {renderer: this.wxRenderer.getRenderer()})
            if (this.wxRenderer.hasFootnotes()) {
                output += this.wxRenderer.buildFootnotes()
            }
            output += '<hr style="border-style: solid;border-width: 1px 0 0;border-color: rgba(0,0,0,0.1);-webkit-transform-origin: 0 0;-webkit-transform: scale(1, 0.5);transform-origin: 0 0;transform: scale(1, 0.5);"/>';
            output += '<small style="text-align:center;display: block; color:rgb(136, 136, 136);">想知道更多？长按/扫码关注我吧↓↓↓</small>'
            output += '<img src="http://www.itmuch.com/icons/wx.jpg" style="text-align: center;display:block; margin: 0 auto; width: 45%;"/>';
            output += '<a href="https://mp.weixin.qq.com/s?__biz=MzI4ODQ3NjE2OA==&mid=2247484896&idx=2&sn=5411222a8b1ebc698f8afdc905abf88e&chksm=ec3c9887db4b119181692ed0b5193929df8ec4672acf418ab283327ec8a33dba09c073183d65&scene=21#wechat_redirect" style="text-align: center;display:block; text-decoration: underline;font-weight: bold;line-height: 200%;">>>>技术讨论群<<<</a>'
            output += '<small style="text-align: right; display:block;  font-weight: bold">喜欢就点个' +
                '<span style="color: rgb(0, 82, 255);">"在看"</span>呗^_^</small>';
            return output
        },
        themeChanged: function () {
            this.editor.setOption('theme', this.currentEditorTheme)
        },
        fontChanged: function (fonts) {
            this.wxRenderer.setOptions({
                fonts: fonts
            })
            this.refresh()
        },
        refresh: function () {
            this.output = this.renderWeChat(this.editor.getValue())
        },
        copy: function () {
            var clipboardDiv = document.getElementById('output')
            clipboardDiv.focus();
            window.getSelection().removeAllRanges();
            var range = document.createRange();
            range.setStartBefore(clipboardDiv.firstChild);
            range.setEndAfter(clipboardDiv.lastChild);
            window.getSelection().addRange(range);

            try {
                if (document.execCommand('copy')) {
                    this.$message({
                        message: '已复制到剪贴板', type: 'success'
                    })
                } else {
                    this.$message({
                        message: '未能复制到剪贴板，请全选后右键复制', type: 'warning'
                    })
                }
            } catch (err) {
                this.$message({
                    message: '未能复制到剪贴板，请全选后右键复制', type: 'warning'
                })
            }
        }
    }
})