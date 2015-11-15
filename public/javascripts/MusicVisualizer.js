/**
 * Created by Ibokan on 2015/11/3.
 */
function MusicVisualizer(obj){
    this.source = null;
    this.count = 0;

    this.analyer = MusicVisualizer.ac.createAnalyser();
    this.size = obj.size;
    this.analyer.fftSize = this.size * 2;

    this.gainNode = MusicVisualizer.ac[MusicVisualizer.ac.createGain ? "createGain":"createGainNode"]()
    this.gainNode.connect(MusicVisualizer.ac.destination);

    this.analyer.connect(this.gainNode);
    this.xhr = new XMLHttpRequest();
    this.visualizer = obj.visualizer;
    this.visualize();
}
MusicVisualizer.ac = new (window.AudioContext||window.webkitAudioContext)();

MusicVisualizer.prototype.load = function(url,fun){
   this.xhr.abort();
    this.xhr.open("GET",url);
    this.xhr.responseType = 'arraybuffer';
    var self = this;
    this.xhr.onload = function(){
        fun(self.xhr.response);
    }
    this.xhr.send();
}
MusicVisualizer.prototype.decode = function(arraybuffer,fun){
    MusicVisualizer.ac.decodeAudioData(arraybuffer,function(buffer){
        fun(buffer)},function(error){
        console.log(error);
    })
}
MusicVisualizer.prototype.play = function(url){
  var n = ++this.count;
   var self = this ;
    this.source && this.stop();
    this.load(url,function(arraybuffer){
        if(n!=self.count)return;
        self.decode(arraybuffer,function(buffer){
            if(n!=self.count)return;
            var bs  = MusicVisualizer.ac.createBufferSource();
            bs.connect(self.analyer);
            bs.buffer = buffer;
            bs[bs.start ? 'start':'noteOn'](0);
            self.source = bs;
        })
    })
}
MusicVisualizer.prototype.stop = function(){
    this.source[this.source.stop ? 'stop':'noteOff'](0);

}
MusicVisualizer.prototype.changeVolume = function(percent){
    this.gainNode.gain.value = percent * percent;
}
//以下是可视化的代码
MusicVisualizer.prototype.visualize = function(){
    var arr = new Uint8Array(this.analyer.frequencyBinCount);//shuzu
    var requestAnimationFrame = window.requestAnimationFrame||
        window.webkitRequestAnimationFrame()||
        window.mozRequestAnimationFrame;
    var self = this;
    function v(){
        self.analyer.getByteFrequencyData(arr);
        //console.log(arr);
         self.visualizer(arr);
        requestAnimationFrame(v);
    }

    requestAnimationFrame(v);
}