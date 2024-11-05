import { Document } from '../components/document';
import DocumentDAO from '../dao/documentDAO';

/**
 * Represents a controller for managing documents.
 * All methods of this class must interact with the corresponding DAO class to retrieve or store data.
 */
class DocumentController {
  private dao: DocumentDAO;

  constructor() {
    this.dao = new DocumentDAO();
  }

  /**
   * Creates a new document.
   * @param title - The title of the document. It must not be null.
   * @param desc - The description of the document. It must not be null.
   * @param scale - The scale of the document. It must not be null.
   * @param issuanceDate - The issuance date of the document. It must not be null.
   * @param type - The type of the document. It must not be null.
   * @param language - The language of the document. It must not be null.
   * @param pages - The number of pages of the document. It can be null.
   * @param link - The link to the document. It can be null.
   * @param stakeholders - The stakeholders of the document. It must not be null.
   * @returns A Promise that resolves to true if the document has been created.
   */
  async addDocument(
    title: string,
    desc: string,
    scale: string,
    issuanceDate: string,
    type: string,
    language: string,
    link: string | null,
    pages: string | null,
    stakeholders: string[],
  ): Promise<void> {
    const stakeholderExistsPromises = stakeholders.map((stakeholder: string) =>
      this.dao.checkStakeholder(stakeholder),
    );
    const stakeholdersExist = await Promise.all(stakeholderExistsPromises);
    if (stakeholdersExist.some(exists => !exists)) {
      throw new Error('One or more stakeholders do not exist');
    }
    await this.dao.checkDocumentType(type);
    await this.dao.checkLanguage(language);
    await this.dao.checkScale(scale);
    const documentID = await this.dao.addDocument(
      title,
      desc,
      scale,
      issuanceDate,
      type,
      language,
      link,
      pages,
    );
    const addStakeholdersPromises = stakeholders.map((stakeholder: string) =>
      this.dao.addStakeholderToDocument(documentID, stakeholder),
    );
    await Promise.all(addStakeholdersPromises);
  }

  /**
   * Returns a specific document.
   * @param id - The id of the document to retrieve. The document must exist.
   * @returns A Promise that resolves to the document with the specified id.
   */
  async getDocumentById(id: number): Promise<Document> {
    return this.dao.getDocumentById(id);
  }

  /**
   * Returns all documents.
   * @returns A Promise that resolves to an array containing all documents.
   */
  async getAllDocuments(): Promise<Document[]> {
    return this.dao.getAllDocuments();
  }

  /**
   * Updates a document.
   * @param id - The id of the document to update. The document must exist.
   * @param title - The new title of the document. It must not be null.
   * @param desc - The new description of the document. It must not be null.
   * @param scale - The new scale of the document. It must not be null.
   * @param issuanceDate - The new issuance date of the document. It must not be null.
   * @param type - The new type of the document. It must not be null.
   * @param language - The new language of the document. It must not be null.
   * @param pages - The new number of pages of the document. It can be null.
   * @param link - The new link to the document. It can be null.
   * @returns A Promise that resolves to true if the document has been updated.
   */
  async updateDocument(
    id: number,
    title: string,
    desc: string,
    scale: string,
    issuanceDate: string,
    type: string,
    language: string,
    link: string | null,
    pages: string | null,
    stakeholders: string[],
  ): Promise<void> {
    const stakeholderExistsPromises = stakeholders.map((stakeholder: string) =>
      this.dao.checkStakeholder(stakeholder),
    );
    const stakeholdersExist = await Promise.all(stakeholderExistsPromises);
    if (stakeholdersExist.some(exists => !exists)) {
      throw new Error('One or more stakeholders do not exist');
    }
    await this.dao.checkDocumentType(type);
    await this.dao.checkLanguage(language);
    await this.dao.checkScale(scale);
    await this.dao.updateDocument(
      id,
      title,
      desc,
      scale,
      issuanceDate,
      type,
      language,
      link,
      pages,
    );
    await this.dao.deleteStakeholdersFromDocument(id);
    const addStakeholdersPromises = stakeholders.map((stakeholder: string) =>
      this.dao.addStakeholderToDocument(id, stakeholder),
    );
    await Promise.all(addStakeholdersPromises);
  }

  /**
   * Deletes a document.
   * @param id - The id of the document to delete. The document must exist.
   * @returns A Promise that resolves to true if the document has been deleted.
   */
  async deleteDocument(id: number): Promise<boolean> {
    return this.dao.deleteDocument(id);
  }

  /**
   * Updates the description of a document.
   * @param id - The id of the document to update. The document must exist.
   * @param desc - The new description of the document. It must not be null.
   * @returns A Promise that resolves to true if the document has been updated.
   */
  async updateDocumentDescription(id: number, desc: string): Promise<boolean> {
    return this.dao.updateDocumentDesc(id, desc);
  }

  /**
   * Checks if every stakeholder in the list exists.
   * @param stakeholders - The list of stakeholders to check.
   * @returns A Promise that resolves to true if all stakeholders exist.
   * @throws StakeholderNotFoundError if any stakeholder does not exist.
   */
  async checkStakeholder(stakeholder: string): Promise<boolean> {
    return this.dao.checkStakeholder(stakeholder);
  }
}

export default DocumentController;
