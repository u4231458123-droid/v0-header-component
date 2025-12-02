import sharp from "sharp"
import fs from "fs"

const inputPath = "./public/images/my-dispatch-logo.png"
const outputPath = "./public/images/my-dispatch-logo-processed.png"

async function processLogo() {
  try {
    console.log("[v0] Starting logo processing...")

    // Read the image
    const image = sharp(inputPath)
    const metadata = await image.metadata()

    console.log(`[v0] Original size: ${metadata.width}x${metadata.height}`)

    // Process the image:
    // 1. Remove the grayish/checkered background by making near-gray colors transparent
    // 2. Trim the transparent edges
    // 3. Output as PNG with transparency

    const processedImage = await image
      .removeAlpha() // Remove any existing alpha
      .toColourspace("srgb")
      .raw()
      .toBuffer({ resolveWithObject: true })

    const { data, info } = processedImage
    const { width, height, channels } = info

    // Create new buffer with alpha channel
    const newData = Buffer.alloc(width * height * 4)

    for (let i = 0; i < width * height; i++) {
      const r = data[i * channels]
      const g = data[i * channels + 1]
      const b = data[i * channels + 2]

      // Check if pixel is part of the checkered/gray background
      // The checkered pattern has alternating light and darker gray
      const isGray = Math.abs(r - g) < 15 && Math.abs(g - b) < 15 && Math.abs(r - b) < 15
      const isLightGray = isGray && r > 140 && r < 220
      const isVeryLight = r > 230 && g > 230 && b > 230

      // Make background transparent
      const isBackground = isLightGray || isVeryLight

      newData[i * 4] = r
      newData[i * 4 + 1] = g
      newData[i * 4 + 2] = b
      newData[i * 4 + 3] = isBackground ? 0 : 255 // Alpha: 0 = transparent, 255 = opaque
    }

    // Create image with alpha and trim
    const result = await sharp(newData, {
      raw: {
        width,
        height,
        channels: 4,
      },
    })
      .trim() // Remove transparent edges
      .png()
      .toBuffer()

    // Save the processed image
    fs.writeFileSync(outputPath, result)

    // Get final dimensions
    const finalMeta = await sharp(result).metadata()
    console.log(`[v0] Processed size: ${finalMeta.width}x${finalMeta.height}`)
    console.log(`[v0] Logo saved to: ${outputPath}`)

    // Replace original with processed
    fs.copyFileSync(outputPath, inputPath)
    fs.unlinkSync(outputPath)
    console.log("[v0] Original logo replaced with processed version")
  } catch (error) {
    console.error("[v0] Error processing logo:", error)
  }
}

processLogo()
