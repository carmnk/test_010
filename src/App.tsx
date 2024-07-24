import { useMemo, useState } from 'react'
import { HtmlRenderer } from '../../html_editor/src/HtmlEditor/renderer/HtmlRenderer'
import { useEditorController } from '../../html_editor/src/HtmlEditor/editorController/editorController'
import appData from './app_data.json'
import { BrowserRouter } from 'react-router-dom'
import { transformEditorStateFromPayload } from '../../html_editor/src/HtmlEditor/apiController/transformEditorDbState'
import { baseComponents } from '../../html_editor/src/HtmlEditor/editorComponents/baseComponents'
import { defaultEditorState } from '../../html_editor/src/HtmlEditor/editorController/editorState'
import { buttonEditorComponentDef } from '../../html_editor/src/HtmlEditor/editorComponents/components/Button/buttonDef'

console.log('appData', appData)

function App() {
  const appDataAdj = useMemo(() => {
    const transformedState = transformEditorStateFromPayload(
      appData as any,
      defaultEditorState(),
      baseComponents
    )
    console.log('TRANSFORM', appData, transformedState)

    // adjust images -> images are currently supposed to be in the json - imageFiles.[n].image
    //CLOUD SOLutioN BACK !!!
    const adjImages = transformedState.assets.images.map((img) => ({
      ...img,
      image:
        appData.imageFiles.find((file) => file.asset_id === img._id)?.image ||
        null,
    }))
    return {
      ...transformedState,
      elements: transformedState.elements.map((el) =>
        el._type === 'img' && el.attributes?.src
          ? {
              ...el,
              attributes: {
                ...el.attributes,
                src:
                  adjImages.find((adjImg) => adjImg._id === el?.attributes?.src)
                    ?.image || null,
              },
            }
          : el
      ),
      assets: {
        ...transformedState.assets,
        images: adjImages,
      },
    }
  }, [])

  const editorController = useEditorController({
    initialEditorState: appDataAdj,
    // injections: {
    //   components: [...baseComponents, buttonEditorComponentDef],
    // },
  })
  const theme = editorController.editorState.theme

  console.log('appData Adjusted ', appDataAdj)
  return (
    <>
      <BrowserRouter>
        <HtmlRenderer
          editorController={editorController}
          theme={theme}
          isProduction
        ></HtmlRenderer>
      </BrowserRouter>
    </>
  )
}

export default App
