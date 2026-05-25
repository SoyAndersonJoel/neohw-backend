import { Injectable, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../../infrastructure/prisma/prisma.service';
import type { IStorageService } from '../../../storage/application/services/cloudinary.service';
import { STORAGE_SERVICE } from '../../../storage/storage.tokens';
import { OrderDocumentType } from '../../../../generated/prisma/enums';

// Formatos permitidos: imágenes comunes y PDF
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf',
];

// Tamaño máximo: 5 MB
const MAX_FILE_SIZE = 5 * 1024 * 1024;

// Tipos válidos de documento
const VALID_DOCUMENT_TYPES: string[] = Object.values(OrderDocumentType);

// Mapeo de carpetas organizadas en Cloudinary
const FOLDER_MAP: Record<string, string> = {
  SHIPPING_PROOF: 'neohw/orders/shipping_proofs',
  DELIVERY_PHOTO: 'neohw/orders/delivery_photos',
  CUSTOMER_SIGNATURE: 'neohw/orders/signatures',
};

@Injectable()
export class UploadOrderDocumentUseCase {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(STORAGE_SERVICE)
    private readonly storageService: IStorageService,
  ) {}

  async execute(orderId: string, file: Express.Multer.File, documentType: OrderDocumentType) {
    // 1. Validar que se proporcionó un archivo
    if (!file) {
      throw new BadRequestException('Archivo no proporcionado');
    }

    // 2. Validar tipo de documento (SHIPPING_PROOF, DELIVERY_PHOTO, CUSTOMER_SIGNATURE)
    if (!VALID_DOCUMENT_TYPES.includes(documentType)) {
      throw new BadRequestException(
        `Tipo de documento inválido: "${documentType}". Valores permitidos: ${VALID_DOCUMENT_TYPES.join(', ')}`,
      );
    }

    // 3. Validar formato del archivo (MIME type)
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      throw new BadRequestException(
        `Formato de archivo no permitido: "${file.mimetype}". Formatos aceptados: JPEG, PNG, WEBP, PDF`,
      );
    }

    // 4. Validar peso del archivo
    if (file.size > MAX_FILE_SIZE) {
      throw new BadRequestException(
        `El archivo excede el límite de 5MB. Tamaño recibido: ${(file.size / (1024 * 1024)).toFixed(2)}MB`,
      );
    }

    // 5. Verificar que la orden existe
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new NotFoundException(`Pedido ${orderId} no encontrado`);
    }

    // 6. Determinar la carpeta en Cloudinary
    const folder = FOLDER_MAP[documentType] || 'neohw/orders/misc';

    // 7. Subir a Cloudinary
    const fileUrl = await this.storageService.uploadDocument(file, folder);

    // 8. Registrar en la base de datos
    const orderDocument = await this.prisma.orderDocument.create({
      data: {
        orderId,
        documentType,
        fileUrl,
      },
    });

    return orderDocument;
  }
}

