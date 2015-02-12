/**
 * 系统配置文件
 */

//1秒，1分钟，1小时
var sec = 1000, min = 60 * sec, hr = 60 * min,
    sys_config = {
        sec: sec,//1秒
        min: min,//1分钟
        hr: hr,//1小时

        //数据库连接池最大容量
        connectionLimit: 10,
        //数据库地址
        host: 'localhost',
        //数据库用户名
        user: 'root',
        //数据库密码
        password: 'root',
        //数据库表名
        database: 'tmnlhub',

        //设备连接端口
        tmnl_port: 5805,
        //设备链接超时时间（0为永不超时）
        tmnl_delay_timeout: 5 * min,
        //设备通讯超时时间（0为永不超时）
        tmnl_recv_timeout: 10 * sec,

        //WebService通讯端口
        web_port: 2355,
        //设备上报事件广播端口
        broadcast: 2356,

        //管理界面端口
        admin_port: 13887,

        //相关日志目录
        sys_log: 'logs/sys',
        sys_alert: 'logs/sys',
        sys_err: 'logs/sys',
        sys_packets: 'logs/packets',

        //调试开关
        debug: true
    };

exports.config = sys_config;