class WebGPU {
  initiated = false;
  WORKGROUP_SIZE = 8;
  UPDATE_INTERVAL = 100;
  constructor(canvas) {
    this.canvas = canvas;
  }

  async init() {
    const adapter = await navigator.gpu.requestAdapter();
    if (!adapter) throw new Error("Adapter not found");
    this.device = await adapter.requestDevice();
    if (!this.device) throw new Error("device not found");

    this.ctx = this.canvas.getContext("webgpu");
    this.canvasFormat = navigator.gpu.getPreferredCanvasFormat();

    this.ctx.configure({
      device: this.device,
      format: this.canvasFormat,
      alphaMode: "premultiplied",
    });

    const vertexShader = await fetch("/canvas-controller/shaders/vertex.wgsl").then(
      (res) => res.text()
    );
    this.vertexShader = this.device.createShaderModule({
      label: "Particle natural flow shader",
      code: vertexShader,
    });

    const fragmentShader = await fetch(
      "/canvas-controller/shaders/fragment.wgsl"
    ).then((res) => res.text());
    this.fragmentShader = this.device.createShaderModule({
      label: "fragment shader",
      code: fragmentShader,
    });

    this.pipeline = this.device.createRenderPipeline({
      layout: "auto",
      vertex: {
        module: this.vertexShader,
        entryPoint: "main",
      },
      fragment: {
        module: this.fragmentShader,
        entryPoint: "main",
        targets: [
          {
            format: this.canvasFormat,
          },
        ],
      },
      primitive: {
        topology: "triangle-list",
      },
    });

    this.initiated = true;
  }

  frame() {

    const commandEncoder = this.device.createCommandEncoder();
    const textureView = this.ctx.getCurrentTexture().createView();

    const renderPassDescriptor = {
      colorAttachments: [
        {
          view: textureView,
          clearValue: { r: 0.0, g: 0.0, b: 0.0, a: 0.0 },
          loadOp: "clear",
          storeOp: "store",
        },
      ],
    };

    const passEncoder = commandEncoder.beginRenderPass(renderPassDescriptor);
    passEncoder.setPipeline(this.pipeline);
    passEncoder.draw(3);
    passEncoder.end();

    this.device.queue.submit([commandEncoder.finish()]);
    requestAnimationFrame(this.frame.bind(this));
  }
}

export default WebGPU;
