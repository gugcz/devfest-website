<template>
  <v-main>
    <!-- User your Component Here -->
    <v-container fluid>
      <v-row align="center" justify="center" class="">
        <v-col md="11" lg="9" sm="12" class="my-md-10 my-0 py-5 px-5 px-md-0">
          <v-container fluid>
            <v-row justify="center" align="center">
              <!-- For Mobile -->
              <v-col cols="12" class="d-block d-sm-block d-md-none px-0">
                <p class="h1-heading">DevFest.cz Badge</p>
                <p class="google-font">
                  Unikátní konference si žádá unikátní přístup. Co takhle si vytvořit personalizovaný DevFest.cz 2021 badge? Stačí nahrát obrázek a vygenerujeme vám badge na míru s DevFest.cz 2021 rámečkem. A nezapomeňte se s ním pochlubit na sociálních sítích s hashtagem #DevFestCZ.
                </p>
              </v-col>

              <v-col md="6" sm="12" cols="12" class="order-md-1 order-sm-2 order-2 px-md-7 mt-3 px-0 mb-md-13">
                <!-- For Desktop -->
                <div class="d-none d-sm-none d-md-block mb-10">
                  <p class="h1-heading">DevFest.cz Badge</p>
                  <p class="google-font" style="font-size:18px">
                    Unikátní konference si žádá unikátní přístup. Co takhle si vytvořit personalizovaný DevFest.cz 2021 badge? Stačí nahrát obrázek a vygenerujeme vám badge na míru s DevFest.cz 2021 rámečkem. A nezapomeňte se s ním pochlubit na sociálních sítích s hashtagem #DevFestCZ.
                  </p>
                </div>

                <div class="input">
                  <label class="google-font mb-3" style="font-size:110%"
                    >Vyber obrázek</label
                  >
                  <br />
                  <v-btn
                    class="primary google-font mt-3"
                    depressed
                    large
                    @click="uploadImage()"
                    rounded
                    style="text-transform: capitalize;"
                  >
                    Vyber obrázek
                    <v-icon right>mdi-upload</v-icon>
                  </v-btn>
                  <input
                    class="profile-input"
                    type="file"
                    accept="image/*"
                    @change="upload"
                    hidden
                  />
                </div>
                <div class="mt-5">
                  <label class="google-font mb-5" style="font-size:110%"
                    >Tvar</label
                  >
                  <br />
                  <v-btn-toggle
                    class="mt-3"
                    rounded
                    v-model="shapeData"
                    color="#2B81D6"
                  >
                    <v-btn
                      value="original"
                      class="mx-0 px-5 pb-0"
                      @click="changeShape('original')"
                      >Původní</v-btn
                    >
                    <v-btn
                      class="mx-0 pb-0 px-5"
                      value="Square"
                      @click="changeShape('Square')"
                      >Čtverec</v-btn
                    >
                    <v-btn
                      class="mx-0 pb-0 px-5"
                      value="circle"
                      @click="changeShape('circle')"
                      >Kruh</v-btn
                    >
                  </v-btn-toggle>
                  <!-- <div class="select-container">
                    <div
                      class="select google-font"
                      id="original"
                      selected
                      @click="changeShape('original')"
                    >
                      Original
                    </div>
                    <div
                      class="select google-font"
                      id="square"
                      @click="changeShape('square')"
                    >
                      Square
                    </div>
                    <div
                      class="select google-font"
                      id="circle"
                      @click="changeShape('circle')"
                    >
                      Circle
                    </div>
                  </div> -->
                </div>
                <p class="mt-8 mb-15 mb-md-0">
                  <span
                    ><span style="color:red;">*</span>&nbsp; Respektujeme vaše
                    soukromí a neukládáme vaše fotografie na našem webu.</span
                  >
                </p>
              </v-col>

              <v-col
                md="6"
                sm="12"
                cols="12"
                class="text-center py-md-10 py-5 order-md-2 order-sm-1 order-1"
                style="background:#CDDFFD;border-radius:18px"
              >
                <canvas class=""></canvas>
                <br /><br />
                <!--v-if="downloadbtn"  -->
                <v-btn
                  class="pb-0 mb-0"
                  color="red"
                  dark
                  id="download"
                  @click="download()"
                  ><v-icon left>mdi-arrow-down-bold-circle-outline</v-icon
                  >Download</v-btn
                >
              </v-col>
            </v-row>
          </v-container>
        </v-col>
      </v-row>
    </v-container>
  </v-main>
</template>

<script>
import gdgImage from "@/assets/img/gdg.png";
export default {
  name: "badge",
  data: () => ({
    downloadbtn: false,
    canvas: null,
    shape: "original",
    image: "",
    shapeData: "original",
    ctx: null,
    banner: null,
  }),
  methods: {
    upload(e) {
      if (e && e.target.files && e.target.files[0]) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const img = new Image();
          img.onload = () => {
            this.image = img;
            this.draw();
          };
          img.src = event.target.result;
        };
        reader.readAsDataURL(e.target.files[0]);
      }
    },
    uploadImage() {
      document.querySelector("input.profile-input").click();
      this.downloadbtn = true;
      document.getElementById("download").style.visibility = "visible";
    },
    changeShape(type) {
      this.shape = type;
      this.draw();
    },
    draw() {
      if (this.image) {
        switch (this.shape) {
          case "original": {
            this.canvas.width = this.image.width;
            this.canvas.height = this.image.height;
            this.ctx.drawImage(this.image, 0, 0);
            break;
          }
          default: {
            this.canvas.width = 500;
            this.canvas.height = 500;
            const hRatio = this.canvas.width / this.image.width;
            const vRatio = this.canvas.height / this.image.height;
            const ratio = Math.max(hRatio, vRatio);
            const x = (this.canvas.width - this.image.width * ratio) / 2;
            const y = (this.canvas.height - this.image.height * ratio) / 2;
            this.ctx.drawImage(
              this.image,
              0,
              0,
              this.image.width,
              this.image.height,
              x,
              y,
              this.image.width * ratio,
              this.image.height * ratio
            );
            break;
          }
        }
      } else {
        this.ctx.canvas.width = 500;
        this.ctx.canvas.height = 500;
        this.ctx.fillStyle = "#fff";
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      }
      const height =
        (this.banner.height / this.banner.width) * this.canvas.width;
      const y = this.canvas.height - height;
      const fontSize = this.canvas.width / 17.2;
      this.ctx.drawImage(
        this.banner,
        0,
        0,
        this.banner.width,
        this.banner.height,
        0,
        y,
        this.canvas.width,
        height
      );
      this.ctx.fillStyle = "#757575";
      this.ctx.textAlign = "center";
      this.ctx.textBaseline = "middle";
      this.ctx.font = `${fontSize}px Google Sans, sans-serif`;
      // ctx.fillText(category, canvas.width / 2, fontY)
      if (this.shape === "circle") {
        this.ctx.globalCompositeOperation = "destination-in";
        this.ctx.beginPath();
        this.ctx.arc(
          this.canvas.width / 2,
          this.canvas.height / 2,
          this.canvas.height / 2,
          0,
          Math.PI * 2
        );
        this.ctx.closePath();
        this.ctx.fill();
      }
    },
    download() {
      const a = document.createElement("a");
      const url = this.canvas.toDataURL("image/png;base64");
      a.download = "#DevFestCz_badge.png";
      a.href = url;
      a.click();
    },
  },
  created(){
    document.title = 'DevFest Badge | DevFest.cz 2021'
  },
  mounted() {
    this.canvas = document.querySelector("canvas");
    this.ctx = this.canvas.getContext("2d");
    this.image = "";
    this.shape = "original";
    this.downloadbtn = false;
    document.getElementById("download").style.visibility = "hidden";
    this.banner = new Image();
    this.banner.src = gdgImage;
    // console.log(this.banner);
    this.banner.onload = () => {
      this.draw();
    };
  },
};
</script>

<style scoped>
* {
  box-sizing: border-box;
  --shadow-elevation-1: 0 2px 4px -1px rgba(0, 0, 0, 0.2),
    0 4px 5px 0 rgba(0, 0, 0, 0.14), 0 1px 10px 0 rgba(0, 0, 0, 0.12);
  --shadow-elevation-2: 0 3px 5px -1px rgba(0, 0, 0, 0.2),
    0 6px 10px 0 rgba(0, 0, 0, 0.14), 0 1px 18px 0 rgba(0, 0, 0, 0.12);
  --button-color: #2b81d6;
  --button-color-hover: #2b81d6;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.select-container {
  display: flex;
  border-radius: 4px;
  /* border: 1px solid #cacaca; */
  overflow: hidden;
}
.select-container .select {
  background-color: #fff;
  padding: 6px 12px;
  font-size: 15px;
  cursor: pointer;
  transition: background-color 100ms ease;
}
.select-container .select:not(:last-child) {
  border-right: 1px solid #cacaca;
}
.select-container .select[selected] {
  color: #fff;
  background-color: var(--button-color);
}
.preview-panel {
  padding: 36px 0;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}
canvas {
  width: 500px;
  max-width: 80%;
}

.blue-btn {
  background-color: #2b81d6;
  border-color: #2b81d6;
  text-transform: capitalize;
  border-radius: 5px;
  color: #fff;
  text-decoration: none;
  font-size: 18px;
  padding: 8px 20px;
  box-shadow: 0px 3px 5px #f2f2f2;
}
.border-btn {
  text-transform: capitalize;
  border-radius: 50%;
  border: 1px solid rgb(224, 224, 224);
  color: #2b81d6;
  background-color: white;
  text-decoration: none;
  font-size: 18px;
  padding: 8px 20px;
}
.border-btn:hover {
  background-color: #f5f5f5;
}
@media screen and (max-width: 860px) {
  .main-container {
    flex-direction: column;
  }
  .input-panel,
  .preview-panel {
    width: 100%;
    max-width: initial;
  }
  .preview-panel {
    padding: 24px 0 96px 0;
    flex: 1;
  }
  .input {
    margin-bottom: 24px;
  }
}
</style>
