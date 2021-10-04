function scheduleHtmlProvider() {
  var kbtable = document.getElementById('kblist_table')
  if (!kbtable) alert(`
          没有获取到课表哦
          反馈群: 884813590
          -------
          导入流程：
           >> 输入账号密码
           >> 点击右上角头像旁三条横线
           >> 依次: 选课>学生课表查询
           >> 点击<一键导入>`)
  return kbtable.outerHTML
}
// 接口？
/* const d = new Date()
const yr = d.getFullYear(),
  xq = d.getMonth() > 2 && d.getMonth() < 8 ? 1 : 4
const xhr = new XMLHttpRequest()
xhr.open('GET', `http:// xxxxxxxxx /jwglxt/kbcx/xskbcx_cxXsKb.html?xnm=${yr}&xqm=${xq}`, false)

let rt = ''
xhr.onreadystatechange = () => {
  if (xhr.readyState == 4 && xhr.status == 200) rt = xhr.responseText
}
xhr.send() */