import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, KeyboardSensor, PointerSensor, TouchSensor, closestCenter, useSensor, useSensors } from '@dnd-kit/core'
import './App.css'
import { SortableContext, arrayMove, rectSortingStrategy, sortableKeyboardCoordinates } from '@dnd-kit/sortable'
import { useState } from 'react'
import { ImageGallery } from './types/global.types'
import { initialImageData } from './data'
import ImageCard from './components/Cards/ImageCard'
import AddImageCard from './components/AddImageCard'
import ImageOverlayCard from './components/Cards/ImageOverlayCard'
import Header from './components/Header/Header'

function App() {
  const [galleryData, setGalleryData] = useState(initialImageData);

  // handleSelectImage
  const handleSelectImage = (id: string | number) => {
    const newGalleryData = galleryData.map((imageItem) => {
      if (imageItem.id === id) {
        return {
          ...imageItem, isSelected: !imageItem.isSelected
        }
      }
      return imageItem;
    });

    setGalleryData(newGalleryData);
  }


  // dnd code starts here
  const [activeItem, setActiveItem] = useState<ImageGallery | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    }),
    useSensor(TouchSensor)
  )

  const handleDragStart = (event: DragStartEvent) => {
    const { id } = event.active;
    if (!id) return;

    // current item
    const currentItem = galleryData.find((item) => item.id === id);

    if (typeof currentItem === 'string' || typeof currentItem === 'number') {
      setActiveItem(currentItem);
    }
  }
  const handleDragEnd = (event: DragEndEvent) => {
    setActiveItem(null);
    const { active, over } = event;
    if (!over) return;

    if (active.id !== over.id) {
      setGalleryData((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      })
    }
  }

  // dnd code ends here

  const handleDelete = (selectedItems: ImageGallery[]) => {
    const newGallertData = galleryData.filter((ImageItem) => !selectedItems.includes(ImageItem));

    setGalleryData(newGallertData);

  }

  return (
    <div className='min-h-screen flex justify-center'>
      <div className='container flex flex-col items-center'>
        <div className='bg-white my-8 rounded-lg shadow max-w-5xl grid divide-y'>
          <Header onDelete={handleDelete} galleryData={galleryData}/>

          {/* dnd context */}
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <div className='grid grid-cols-2 md:grid-cols-5 gap-8 p-8'>
              <SortableContext items={galleryData} strategy={rectSortingStrategy}>
                {
                  galleryData.map((imageItem) => (
                    <ImageCard key={imageItem.id}
                      id={imageItem.id}
                      isSelected={imageItem.isSelected}
                      slug={imageItem.slug}
                      onClick={handleSelectImage}
                    />
                  ))
                }
              </SortableContext>
              <AddImageCard setGalleryData={setGalleryData} />

              <DragOverlay adjustScale={true} wrapperElement='div'>
                {
                  activeItem ?
                    <ImageOverlayCard className='absolute z-50 h-full w-full' slug={activeItem.slug} />
                  : null
                  }
              </DragOverlay>
            </div>
          </DndContext>
        </div>
      </div>
    </div>
  )
}

export default App
