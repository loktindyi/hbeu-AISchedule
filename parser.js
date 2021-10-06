const generateSectionTimes = me => {
    const timeThruster = (tRaw, distance) => {
        let [tRawHour, tRawMinute] = tRaw.split(':')
        let increasedMinute = Number(tRawMinute) + distance
        let tHour = Number(tRawHour) + parseInt(increasedMinute / 60)
        let tMinute = increasedMinute % 60
        if (tHour < 10) tHour = "0" + tHour
        if (tMinute < 10) tMinute = "0" + tMinute
        return tHour + ':' + tMinute
    }
    ['longRestAt', 'spClassAt', 'spRestAt'].forEach(e => {
        if (typeof (me[e]) == 'undefined') me[e] = []
    })
    me.sunRisesAt.forEach((e, i) => {
        me.sunRisesAt[i] = e.slice(0, 2) + ':' + e.slice(2, 4)
    })
    var i = 1, you = []
    for (t in me.painCounts) {
        let cBeginTime = me.sunRisesAt[t]
        for (let x = me.painCounts[t] + i; i < x; i++) {
            let cEndTime = timeThruster(cBeginTime, ~me.spClassAt.indexOf(i) ? me.spClassKeeps : me.classKeeps)
            you.push({ section: i, startTime: cBeginTime, endTime: cEndTime })
            cBeginTime = timeThruster(cEndTime, ~me.longRestAt.indexOf(i) ? me.longRest : (~me.spRestAt.indexOf(i) ? me.spRest : me.shortRest))
        }
    }
    console.log('%c TriLingvo %c 生成了时间信息：', 'color:#fff;background-color:#fa7298;border-radius:8px', '')
    console.table(you)
    return you
}

/**
 * @param {string} weekStr - 周次字符串
 * @param {string|RegExp} remove - 需要去掉的字符串
 * @param {string|RegExp} separator - 使用...分割多个周区间
 * @param {string|RegExp} secondSeparator - 使用...分割周区间内周起始与结束
 * @returns {Array} 周次数组
 */
const getWeeks = ({ weekStr, remove = /周/g, separator = ',', secondSeparator = '-' }) => {
    let weeks = []
    weekStr.replace(remove, '').split(separator).forEach(weekInterval => {
        if (~weekInterval.search(secondSeparator)) {
            let flag = 0
            if (~weekInterval.search('单')) flag = 1
            if (~weekInterval.search('双')) flag = 2
            const [start, end] = weekInterval.replace(/单|双/, '').split(secondSeparator).map(v => parseInt(v))
            for (let i = start; i <= end; i++) {
                if (!flag) weeks.push(i)
                else if (flag && !((i + flag) % 2) && !weeks.includes(i)) weeks.push(i)
            }
        } else if (weekInterval.length) {
            let v = parseInt(weekInterval)
            if (!weeks.includes(v)) weeks.push(v)
        }
    })
    if (!weeks.length) console.log('空的周信息，原始字符串为：', weekStr)
    return weeks
}

/**
 * @param {string} secStr - 节次字符串
 * @param {string|RegExp} remove - 需要去掉的字符串
 * @param {string|RegExp} separator - 使用...分割
 * @returns {Array} 节次
 */
const getSections = ({ secStr, remove = /第|节/g, separator = /-|,/ }) => {
    const jc = secStr.replace(remove, '').split(separator).map(v => parseInt(v))
    const [start, end] = [jc[0], jc[jc.length - 1]]
    let sections = []
    for (let i = start; i <= end; i++) sections.push({ section: i })
    if (!sections.length) console.log('空的节信息，原始字符串为：', sections)
    return sections
}

/**
 * @param {string} str - 包含周与节次的字符串
 * @param {string|RegExp} separator - 使用...分割
 * @param {string|RegExp} remove - 需要去掉的字符串
 * @param {boolean} mode - true: 周在前(默认) | false: 节在前
 * @returns {Array} [weeks, sections]
 */
const getTime = ({ str, separator = null, remove = '', mode = true }) => {
    const ws = str.replace(remove, '').split(separator).map(x => x.replace('，', ','))
    return [getWeeks({ weekStr: ws[mode ? 0 : 1] }), getSections({ secStr: ws[mode ? 1 : 0] })]
}

function scheduleHtmlParser(html) {
    let result = []
    const $ = cheerio.load(html, { decodeEntities: false })
    $('#kblist_table tbody').slice(1).each(function (weekday) {
        let jc = undefined
        $(this).find('tr').slice(1).each(function () {
            let tds = $(this).children('td')
            if (tds.first().attr('id')) {
                jc = getSections({ secStr: tds.first().text().trim() })
                tds = tds.slice(1)
            }
            tds.each(function () {
                let info = []
                $(this).find('p font').each(function () { info.push($(this).text().trim().split('：').pop()) })
                result.push({
                    name: $(this).find('.title').text().replace('【调】', ''),
                    teacher: info[2],
                    position: info[1].replace(/\)|）/, '').replace(/\(|（|楼/g, '-'),
                    day: weekday + 1,
                    weeks: getWeeks({ weekStr: info[0] }),
                    sections: jc
                })
            })
        })
    })
    console.log(result)
    return {
        courseInfos: result, sectionTimes: generateSectionTimes({
            classKeeps: 45,                             //课程时长(分钟)
            shortRest: 10,                              //短课间休息时长(分钟)
            longRest: 20,                               //长课间休息时长(分钟)     此项可省略
            longRestAt: [2, 6],                         //长课间休息在哪些节数后   此项可省略
            sunRisesAt: ["0800", "1400", "1900"],       //各时间段课程开始时间(HHmm)
            painCounts: [4, 4, 3],                      //各时间段课程节数
        })
    }
}
