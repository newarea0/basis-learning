console.log('111')
import sensors from 'sa-sdk-javascript';

sensors.init({
  // server_url: `https://sc-clog.skysrt.com/sa?project=${
  //   import.meta.env.MODE === 'production' ? 'production' : 'default'
  // }`,
  // is_track_single_page: true, // 单页面配置，默认开启，若页面中有锚点设计，需要将该配置删除，否则触发锚点会多触发 $pageview 事件
  // use_client_time: true,
  // send_type: 'ajax', // beacon
  // show_log: false,
  // heatmap: {
  //   // 是否开启点击图，default 表示开启，自动采集 $WebClick 事件，可以设置 'not_collect' 表示关闭。
  //   clickmap: 'default',
  //   // 是否开启触达图，not_collect 表示关闭，不会自动采集 $WebStay 事件，可以设置 'default' 表示开启。
  //   scroll_notice_map: 'default'
  // }

  server_url: 'http://10.120.195.209:8106/sa?project=default',
  // server_url: 'https://sc-clog.skysrt.com/sa?project=default',
  heatmap: {
    // 视区停留事件($WebStay) https://manual.sensorsdata.cn/sa/docs/tech_sdk_client_web_all_use/v0300#%E8%A7%86%E5%8C%BA%E5%81%9C%E7%95%99%E4%BA%8B%E4%BB%B6($WebStay)
    scroll_notice_map: 'default',
    // Web 元素点击(event $WebClick) https://manual.sensorsdata.cn/sa/docs/tech_sdk_client_web_all_use/v0300#Web_%E5%85%83%E7%B4%A0%E7%82%B9%E5%87%BB($WebClick)
    clickmap: 'default'
  },
  is_track_single_page: true,
  use_client_time: true,
  send_type: 'beacon',
  show_log: true,
});

// 注册公共属性，位于 properties 属性下，所有事件生效
sensors.registerPage({
  aaa: '111',
	current_url: location.href,
	referrer: document.referrer
});

// Web 页面浏览(event $pageview)
// https://manual.sensorsdata.cn/sa/docs/tech_sdk_client_web_all_use/v0300#Web_%E9%A1%B5%E9%9D%A2%E6%B5%8F%E8%A7%88($pageview)
sensors.quick('autoTrack', {
  // 注册公共属性，位于 properties 属性下，仅 Web 页面浏览生效
  platform: 'tv-web',
});

document.querySelector('#sensorsdata').addEventListener('click', () => {
  // 自定义事件(event getCode)
  // https://manual.sensorsdata.cn/sa/docs/tech_sdk_client_web_use/v0300#%E4%BB%A3%E7%A0%81%E5%9F%8B%E7%82%B9%E8%BF%BD%E8%B8%AA%E4%BA%8B%E4%BB%B6
  sensors.track('getCode', {
    service: 'login',
  });
});

document.querySelector('#scroll-notice-map').addEventListener('click', () => {
  // https://manual.sensorsdata.cn/sa/docs/tech_sdk_client_web_api/v0300#setProfile(properties)
  // sensors.setProfile({'ccc': '333'});

  sensors.login('123456');
});
